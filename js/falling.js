// ============================================================
// falling.js — "La Pluie de Nourriture" (falling food) game mode.
//
// Foods fall from the top. A French word says which one to catch.
// Click (or tap) the right food before it reaches the bottom.
//   Right food caught       → +1 point, and a new word to find
//   Wrong food clicked      → lose a heart
//   Right food falls past   → lose a heart
// 3 hearts. The game gets faster as your score goes up.
// Catching FALL_GOAL foods completes the game (1 star, the first time).
// Uses helpers from game.js: showScreen, shuffle, pictureFoods,
// showModeResult, playSound, withArticle.
// ============================================================

const FALL_LIVES = 3;
const FALL_GOAL = 10;             // foods to catch to complete the game
const FALL_START_SPEED = 55;      // pixels per second at the start
const FALL_SPEED_STEP = 7;        // faster after each catch...
const FALL_MAX_SPEED = 190;       // ...up to this speed
const FALL_SPAWN_START = 1100;    // milliseconds between new foods at the start
const FALL_SPAWN_MIN = 550;       // fastest spawning

const fall = {
  running: false,
  score: 0,
  lives: FALL_LIVES,
  target: null,       // the word to catch
  items: [],          // foods on screen: { word, button, y }
  missed: [],         // ids of words to review
  lastFrame: 0,       // time of the last animation frame
  sinceSpawn: 0,      // milliseconds since the last food appeared
  frameId: null,
};

function fallSpeed() {
  return Math.min(FALL_MAX_SPEED, FALL_START_SPEED + fall.score * FALL_SPEED_STEP);
}

function spawnDelay() {
  return Math.max(FALL_SPAWN_MIN, FALL_SPAWN_START - fall.score * 40);
}

function startFalling() {
  stopFalling();
  fall.running = true;
  fall.score = 0;
  fall.lives = FALL_LIVES;
  fall.missed = [];
  fall.items = [];
  fall.sinceSpawn = 0;
  document.getElementById("fall-area").innerHTML = "";
  fallFeedback("", "");
  newTarget();
  showScreen("falling-screen");
  fall.lastFrame = performance.now();
  fall.frameId = requestAnimationFrame(fallStep);
}

// Picks a new word to catch (different from the last one).
function newTarget() {
  const choices = pictureFoods().filter((w) => !fall.target || w.id !== fall.target.id);
  fall.target = pickWeighted(choices, (w) => wordWeight(progress.memory, w.id), 1)[0]; // weak words more often
  document.getElementById("fall-target").textContent = withArticle(fall.target);
  drawFallStatus();
}

// Adds one falling food. If the target isn't on screen, it is often the target.
function spawnFood() {
  const targetOnScreen = fall.items.some((item) => item.word.id === fall.target.id);
  let word;
  if (!targetOnScreen && Math.random() < 0.6) {
    word = fall.target;
  } else {
    const others = pictureFoods().filter((w) => w.id !== fall.target.id);
    word = others[Math.floor(Math.random() * others.length)];
  }

  const area = document.getElementById("fall-area");
  const button = document.createElement("button");
  button.className = "falling-food";
  button.textContent = word.emoji;
  button.setAttribute("aria-label", "nourriture");
  const maxLeft = Math.max(0, area.clientWidth - 56);
  button.style.left = Math.floor(Math.random() * maxLeft) + "px";
  button.style.top = "-50px";
  area.appendChild(button);

  const item = { word, button, y: -50 };
  // pointerdown reacts faster than click for moving targets.
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    catchFood(item);
  });
  fall.items.push(item);
}

// One animation frame: move everything down, spawn new foods, check the bottom.
function fallStep(now) {
  if (!fall.running) return;
  const seconds = Math.min(0.1, (now - fall.lastFrame) / 1000); // cap in case the tab was hidden
  fall.lastFrame = now;

  fall.sinceSpawn += seconds * 1000;
  if (fall.sinceSpawn >= spawnDelay()) {
    fall.sinceSpawn = 0;
    spawnFood();
  }

  const bottom = document.getElementById("fall-area").clientHeight;
  for (const item of [...fall.items]) {
    item.y += fallSpeed() * seconds;
    item.button.style.top = item.y + "px";
    if (item.y > bottom) {
      removeFood(item);
      if (item.word.id === fall.target.id) {
        loseLife("Raté ! (Missed!) C'était " + withArticle(fall.target) + ".");
        if (!fall.running) return;
        newTarget();
      }
    }
  }

  fall.frameId = requestAnimationFrame(fallStep);
}

function catchFood(item) {
  if (!fall.running) return;
  removeFood(item);
  if (item.word.id === fall.target.id) {
    fall.score++;
    remember(item.word.id, true);
    playSound("good");
    fallFeedback("Oui ! " + withArticle(item.word) + " ✓", "good");
    newTarget();
  } else {
    loseLife("Non ! Ça, c'est " + withArticle(item.word) + " (" + item.word.en + ").");
  }
}

function loseLife(message) {
  fall.lives--;
  remember(fall.target.id, false);
  if (!fall.missed.includes(fall.target.id)) fall.missed.push(fall.target.id);
  playSound("bad");
  fallFeedback(message, "bad");
  drawFallStatus();
  if (fall.lives <= 0) endFalling();
}

function removeFood(item) {
  item.button.remove();
  fall.items = fall.items.filter((other) => other !== item);
}

function endFalling() {
  stopFalling();
  showModeResult({
    id: "falling",
    title: "La Pluie de Nourriture : fini ! 🌧️",
    score: fall.score,
    scoreText: fall.score + (fall.score === 1 ? " mot attrapé" : " mots attrapés") + " (words caught)",
    lines: [],
    missed: fall.missed,
    completed: fall.score >= FALL_GOAL,
    goal: "attrape " + FALL_GOAL + " aliments (catch " + FALL_GOAL + " foods)",
    replay: startFalling,
  });
}

function stopFalling() {
  fall.running = false;
  cancelAnimationFrame(fall.frameId);
}

// ---------- Drawing ----------

function drawFallStatus() {
  document.getElementById("fall-status").textContent =
    "Score : " + fall.score + " · " + "❤️".repeat(Math.max(0, fall.lives)) + "🖤".repeat(FALL_LIVES - Math.max(0, fall.lives));
}

function fallFeedback(message, type) {
  const box = document.getElementById("fall-feedback");
  box.textContent = message;
  box.className = "feedback " + type;
}

document.getElementById("fall-quit-button").addEventListener("click", () => {
  stopFalling();
  showLevels();
});
