// ============================================================
// shop.js — "La Boutique du Chef": spend collected stars on clothes.
//
//   renderChefs()                 redraws every chef on the page in his clothes
//   showChefReaction(where, n)    chef + message on the recipe or level results
//   showShop()                    the shop screen
// Uses progress.js (stars, owned clothes) and chef.js (CLOTHES, drawChef).
// ============================================================

// Every element with class "chef-slot" shows the chef in his current clothes,
// and every "star-count" shows how many stars the player has.
function renderChefs() {
  for (const slot of document.querySelectorAll(".chef-slot")) {
    slot.innerHTML = drawChef(progress.wearing);
  }
  for (const count of document.querySelectorAll(".star-count")) {
    count.textContent = progress.stars;
  }
}

// The chef reacts to 1, 2 or 3 stars. where = "done" (one recipe) or "report" (a whole level).
function showChefReaction(where, stars) {
  const chef = document.getElementById(where + "-chef");
  chef.innerHTML = drawChef(progress.wearing, stars === 3 ? "cheer" : "");
  const message = chefSays(stars);
  document.getElementById(where + "-chef-says").textContent = message;
  speakFrench(frenchPart(message)); // Chef Barbe says the French part out loud
}

// ---------- The shop screen ----------

function showShop() {
  document.getElementById("start-over-confirm").hidden = true;
  drawShop();
  showScreen("shop-screen");
}

function drawShop() {
  renderChefs();
  const list = document.getElementById("shop-items");
  list.innerHTML = "";

  for (const slot of Object.keys(SLOT_NAMES)) {
    const heading = document.createElement("h2");
    heading.className = "slot-heading";
    heading.textContent = SLOT_NAMES[slot];
    list.appendChild(heading);

    const row = document.createElement("div");
    row.className = "shop-row";
    for (const item of CLOTHES.filter((c) => c.slot === slot)) {
      row.appendChild(shopCard(item));
    }
    list.appendChild(row);
  }
}

// One item: a small picture of the chef wearing it, its name, and a button.
function shopCard(item) {
  const owned = progress.owned.includes(item.id);
  const wearing = progress.wearing[item.slot] === item.id;

  const card = document.createElement("div");
  card.className = "shop-card" + (wearing ? " wearing" : "");
  card.innerHTML = '<div class="shop-preview"></div><strong></strong><small class="muted"></small>';
  card.querySelector(".shop-preview").innerHTML = drawChef({ [item.slot]: item.id });
  card.querySelector("strong").textContent = item.name;
  card.querySelector("small").textContent = item.en;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "button";
  if (wearing) {
    button.textContent = "Enlever (take off)";
    button.classList.add("secondary");
  } else if (owned) {
    button.textContent = "Porter (wear)";
    button.classList.add("secondary");
  } else {
    button.textContent = "Acheter : " + item.price + " ⭐";
    button.disabled = progress.stars < item.price;
  }
  button.addEventListener("click", () => shopAction(item));
  card.appendChild(button);
  return card;
}

function shopAction(item) {
  const message = document.getElementById("shop-message");
  if (progress.owned.includes(item.id)) {
    toggleWear(progress, item);
    message.textContent = "";
  } else {
    const result = buyItem(progress, item);
    if (result === "ok") {
      playSound("done");
      celebrate();
      message.textContent = "Merci ! Tu as acheté " + item.name + ". (Bought!)";
    } else {
      message.textContent = "Pas assez d'étoiles ! Finis un niveau pour en gagner. (Not enough stars.)";
    }
  }
  saveProgress();
  drawShop();
}

// ---------- Start over (with an in-page confirmation) ----------

document.getElementById("start-over-button").addEventListener("click", () => {
  document.getElementById("start-over-confirm").hidden = false;
});
document.getElementById("start-over-cancel").addEventListener("click", () => {
  document.getElementById("start-over-confirm").hidden = true;
});
document.getElementById("start-over-yes").addEventListener("click", () => {
  startOver();
  state.bestModes = {};
  document.getElementById("start-over-confirm").hidden = true;
  document.getElementById("shop-message").textContent =
    "Tout est effacé. Bonne chance ! (Everything was reset. Good luck!)";
  drawShop();
});

for (const button of document.querySelectorAll(".open-shop-button")) {
  button.addEventListener("click", showShop);
}
document.getElementById("shop-back-button").addEventListener("click", () => showScreen("title-screen"));
document.getElementById("shop-levels-button").addEventListener("click", showLevels);

renderChefs();
