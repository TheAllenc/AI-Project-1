// ============================================================
// cafe.js — "Le Café" game mode: customers order in French and you
// serve them from the counter before their patience runs out.
//
// A round is 8 customers. If 3 customers leave angry, the round ends early.
// Orders get bigger as the round goes on (1 item, then 2, then 3).
// Fast service earns a bigger tip (pourboire) in euros.
// Serving at least CAFE_GOAL customers completes the game (1 star, the first time).
// Uses helpers from game.js: showScreen, shuffle, pictureFoods, pickDistractors,
// showModeResult, playSound, withArticle.
// ============================================================

const CAFE_CUSTOMERS = 8;           // customers per round
const CAFE_LIVES = 3;               // angry customers allowed
const CAFE_GOAL = 5;                // customers to serve to complete the game
const CAFE_SECONDS_BASE = 8;        // patience: base seconds...
const CAFE_SECONDS_PER_ITEM = 5;    // ...plus this many per item ordered
const CAFE_WRONG_PENALTY = 3;       // seconds of patience lost for a wrong item
const CUSTOMER_FACES = ["👩", "👨", "👵", "👴", "🧑", "👧", "👦", "🧔", "👩‍🦰", "👨‍🦱"];

const cafe = {
  running: false,   // false after quitting, so nothing keeps going in the background
  waiting: false,   // true between customers (clicks are ignored)
  served: 0,        // customers served so far
  lost: 0,          // customers who left angry
  customerNumber: 0,
  tips: 0,          // euros earned
  order: [],        // words this customer wants
  delivered: [],    // ids already put on the tray
  patience: 0,      // seconds left for this customer
  maxPatience: 0,
  timerId: null,
  missed: [],       // ids of words to review
};

// How many items customer number n orders (1, 1, 2, 2, 2, 3, 3, 3).
function orderSize(n) {
  if (n <= 2) return 1;
  if (n <= 5) return 2;
  return 3;
}

// "la pomme", "la pomme et le lait", "la pomme, le lait et le pain"
function listInFrench(words) {
  const names = words.map(withArticle);
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(", ") + " et " + names[names.length - 1];
}

function startCafe() {
  cafe.running = true;
  cafe.served = 0;
  cafe.lost = 0;
  cafe.customerNumber = 0;
  cafe.tips = 0;
  cafe.missed = [];
  showScreen("cafe-screen");
  nextCustomer();
}

function nextCustomer() {
  clearInterval(cafe.timerId);
  if (!cafe.running) return; // the player quit
  cafe.waiting = false;
  if (cafe.customerNumber >= CAFE_CUSTOMERS || cafe.lost >= CAFE_LIVES) {
    endCafe();
    return;
  }
  cafe.customerNumber++;

  // The order: random foods with pictures.
  // Customers order words picked by spaced repetition: weak words more often.
  cafe.order = pickWeighted(pictureFoods(), (w) => wordWeight(progress.memory, w.id), orderSize(cafe.customerNumber));
  cafe.delivered = [];
  cafe.maxPatience = CAFE_SECONDS_BASE + CAFE_SECONDS_PER_ITEM * cafe.order.length;
  cafe.patience = cafe.maxPatience;

  document.getElementById("cafe-face").textContent = CUSTOMER_FACES[Math.floor(Math.random() * CUSTOMER_FACES.length)];
  document.getElementById("cafe-order").textContent =
    "Bonjour ! Pour moi, " + listInFrench(cafe.order) + ", s'il vous plaît.";
  document.getElementById("cafe-tray").innerHTML = "";
  cafeFeedback("", "");
  drawCafeCounter();
  drawCafeStatus();

  // Patience goes down 10 times a second.
  cafe.timerId = setInterval(() => {
    cafe.patience -= 0.1;
    drawPatience();
    if (cafe.patience <= 0) customerLeaves();
  }, 100);
  drawPatience();
}

// The counter: the ordered foods plus other foods, shuffled.
function drawCafeCounter() {
  const fakeRecipe = { ingredients: cafe.order.map((w) => w.id) };
  const items = shuffle([...cafe.order, ...pickDistractors(fakeRecipe, SHELF_SIZE - cafe.order.length)]);
  const counter = document.getElementById("cafe-counter");
  counter.innerHTML = "";
  for (const word of items) {
    const button = document.createElement("button");
    button.className = "food";
    button.textContent = word.emoji;
    button.setAttribute("aria-label", "ingrédient");
    button.addEventListener("click", () => serveItem(word, button));
    counter.appendChild(button);
  }
}

function serveItem(word, button) {
  if (cafe.waiting || cafe.patience <= 0) return;
  const wanted = cafe.order.some((w) => w.id === word.id) && !cafe.delivered.includes(word.id);

  if (wanted) {
    playSound("good");
    cafe.delivered.push(word.id);
    remember(word.id, true);
    button.disabled = true;
    button.classList.add("used");
    const item = document.createElement("span");
    item.className = "bowl-item";
    item.textContent = word.emoji;
    document.getElementById("cafe-tray").appendChild(item);
    cafeFeedback("Oui ! " + withArticle(word) + " ✓", "good");

    if (cafe.delivered.length === cafe.order.length) customerServed();
  } else {
    // Wrong item: the customer gets impatient, and we say what it was.
    playSound("bad");
    cafe.patience -= CAFE_WRONG_PENALTY;
    button.classList.remove("shake");
    void button.offsetWidth;
    button.classList.add("shake");
    cafeFeedback("Non ! Ça, c'est " + withArticle(word) + " (" + word.en + ").", "bad");
  }
}

function customerServed() {
  clearInterval(cafe.timerId);
  cafe.waiting = true;
  cafe.served++;
  // Tip: 1 € for being served, +1 € if more than half the patience was left.
  const tip = cafe.patience > cafe.maxPatience / 2 ? 2 : 1;
  cafe.tips += tip;
  playSound("done");
  document.getElementById("cafe-face").textContent = "😊";
  cafeFeedback("Merci ! Au revoir ! (+" + tip + " € de pourboire)", "good");
  drawCafeStatus();
  setTimeout(nextCustomer, 1300);
}

function customerLeaves() {
  clearInterval(cafe.timerId);
  cafe.waiting = true;
  cafe.lost++;
  // The items not served go on the review list.
  for (const word of cafe.order) {
    if (!cafe.delivered.includes(word.id)) remember(word.id, false);
    if (!cafe.delivered.includes(word.id) && !cafe.missed.includes(word.id)) cafe.missed.push(word.id);
  }
  playSound("bad");
  document.getElementById("cafe-face").textContent = "😠";
  cafeFeedback("Trop tard ! Le client voulait : " + listInFrench(cafe.order), "bad");
  drawCafeStatus();
  setTimeout(nextCustomer, 2200);
}

function endCafe() {
  stopCafe();
  showModeResult({
    id: "cafe",
    title: "Le Café : fermé ! ☕",
    score: cafe.tips,
    scoreText: cafe.tips + " € de pourboires (tips)",
    lines: [
      "Clients servis : " + cafe.served + " / " + CAFE_CUSTOMERS,
      "Clients partis (left angry) : " + cafe.lost,
    ],
    missed: cafe.missed,
    completed: cafe.served >= CAFE_GOAL,
    goal: "sers au moins " + CAFE_GOAL + " clients (serve at least " + CAFE_GOAL + " customers)",
    replay: startCafe,
  });
}

function stopCafe() {
  cafe.running = false;
  clearInterval(cafe.timerId);
}

// ---------- Drawing ----------

function drawPatience() {
  const percent = Math.max(0, cafe.patience / cafe.maxPatience) * 100;
  const bar = document.getElementById("cafe-patience");
  bar.style.width = percent + "%";
  bar.className = "patience-fill" + (percent < 30 ? " low" : percent < 60 ? " mid" : "");
}

function drawCafeStatus() {
  document.getElementById("cafe-status").textContent =
    "Client " + cafe.customerNumber + " / " + CAFE_CUSTOMERS +
    " · Pourboires : " + cafe.tips + " € · " +
    "❤️".repeat(CAFE_LIVES - cafe.lost) + "🖤".repeat(cafe.lost);
}

function cafeFeedback(message, type) {
  const box = document.getElementById("cafe-feedback");
  box.textContent = message;
  box.className = "feedback " + type;
}

document.getElementById("cafe-quit-button").addEventListener("click", () => {
  stopCafe();
  showLevels();
});
