// ============================================================
// game.js — runs the game: shows screens, builds the kitchen,
// and reacts when the player clicks an ingredient.
// Uses VOCAB/withArticle/getWord (vocab.js), LEVELS/SHELF_SIZE (recipes.js)
// and targetTime/starsFor/starText (scoring.js).
// ============================================================

// ---------- Game state: everything the game needs to remember ----------
const state = {
  level: null,        // the current level object from LEVELS
  recipeIndex: 0,     // which recipe of the level we are on
  recipe: null,       // the current recipe object
  found: [],          // ids of ingredients already put in the bowl
  mistakes: 0,        // wrong clicks in this recipe
  startTime: 0,       // when this recipe started (milliseconds)
  timerId: null,      // the ticking clock, so we can stop it
  results: [],        // one entry per finished recipe: { recipe, seconds, mistakes, stars }
  missed: [],         // ids of words the player got wrong in this level
  bestStars: {},      // best total stars per level id (only for this visit)
};

// ---------- Small helpers ----------

// Shows one screen (a <section>) and hides all the others.
function showScreen(id) {
  for (const screen of document.querySelectorAll("main > section")) {
    screen.hidden = screen.id !== id;
  }
}

// Returns a shuffled copy of a list (Fisher–Yates shuffle).
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Picks random food words with pictures that are NOT in the recipe.
function pickDistractors(recipe, count) {
  const candidates = VOCAB.filter((word) =>
    word.emoji &&
    !recipe.ingredients.includes(word.id) &&
    !word.categories.includes("meals") &&
    !word.categories.includes("verbs")
  );
  return shuffle(candidates).slice(0, count);
}

// Shows a message under the shelf. type is "good", "bad" or "" (neutral).
function say(message, type) {
  const box = document.getElementById("feedback");
  box.textContent = message;
  box.className = "feedback " + type;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Seconds since the current recipe started.
function elapsedSeconds() {
  return Math.floor((Date.now() - state.startTime) / 1000);
}

// The ingredient the player should look for now (the first one not found yet).
function currentTarget() {
  return state.recipe.ingredients.find((id) => !state.found.includes(id));
}

// ---------- Level select ----------

// A level is open if it has recipes and the level before it was finished.
function isUnlocked(index) {
  if (LEVELS[index].recipes.length === 0) return false;
  return index === 0 || state.bestStars[LEVELS[index - 1].id] !== undefined;
}

function showLevels() {
  const list = document.getElementById("level-list");
  list.innerHTML = "";

  LEVELS.forEach((level, index) => {
    const button = document.createElement("button");
    button.className = "level-card";
    button.disabled = !isUnlocked(index);

    let status;
    if (level.recipes.length === 0) status = "Bientôt (coming soon)";
    else if (!isUnlocked(index)) status = "🔒 Finis le niveau d'avant";
    else if (state.bestStars[level.id] !== undefined)
      status = "Meilleur score : " + state.bestStars[level.id] + " / " + level.recipes.length * 3 + " ★";
    else status = level.recipes.length + " recettes";

    button.innerHTML =
      '<span class="level-emoji"></span><span class="level-text"><strong></strong><small class="goal"></small><small class="status"></small></span>';
    button.querySelector(".level-emoji").textContent = level.emoji;
    button.querySelector("strong").textContent = "Niveau " + (index + 1) + " · " + level.name;
    button.querySelector(".goal").textContent = level.goal;
    button.querySelector(".status").textContent = status;
    button.addEventListener("click", () => startLevel(level));
    list.appendChild(button);
  });

  showScreen("levels-screen");
}

// ---------- Starting a level and a recipe ----------

function startLevel(level) {
  state.level = level;
  state.recipeIndex = 0;
  state.results = [];
  state.missed = [];
  startRecipe();
}

function startRecipe() {
  state.recipe = state.level.recipes[state.recipeIndex];
  state.found = [];
  state.mistakes = 0;

  const count = state.level.recipes.length;
  document.getElementById("level-name").textContent =
    state.level.name + " · recette " + (state.recipeIndex + 1) + " / " + count;
  document.getElementById("recipe-name").textContent = state.recipe.emoji + " " + state.recipe.name;
  document.getElementById("target-time").textContent = targetTime(state.recipe.ingredients.length);
  document.getElementById("bowl").textContent = "";

  drawRecipeCard();
  drawShelf();
  askForNext();
  startTimer();
  showScreen("kitchen-screen");
}

function startTimer() {
  clearInterval(state.timerId);
  state.startTime = Date.now();
  const clock = document.getElementById("timer");
  clock.textContent = "0";
  state.timerId = setInterval(() => {
    clock.textContent = elapsedSeconds();
  }, 250);
}

// Tells the player which ingredient to find next.
function askForNext() {
  say("Trouve : " + withArticle(getWord(currentTarget())), "");
}

// The recipe card: ingredients in French, ticked when found, arrow on the current one.
function drawRecipeCard() {
  const list = document.getElementById("recipe-list");
  list.innerHTML = "";
  const target = currentTarget();
  for (const id of state.recipe.ingredients) {
    const item = document.createElement("li");
    item.textContent = withArticle(getWord(id));
    if (state.found.includes(id)) item.className = "done";
    else if (id === target) item.className = "current";
    list.appendChild(item);
  }
}

// The shelf: the recipe's ingredients mixed with distractors, as emoji buttons.
function drawShelf() {
  const ingredients = state.recipe.ingredients.map(getWord);
  const distractors = pickDistractors(state.recipe, SHELF_SIZE - ingredients.length);
  const shelf = document.getElementById("shelf");
  shelf.innerHTML = "";

  for (const word of shuffle([...ingredients, ...distractors])) {
    const button = document.createElement("button");
    button.className = "food";
    button.textContent = word.emoji;
    button.setAttribute("aria-label", "ingrédient"); // don't give the answer away to screen readers
    button.addEventListener("click", () => pickFood(word, button));
    shelf.appendChild(button);
  }
}

// ---------- Clicking an ingredient ----------

function pickFood(word, button) {
  const target = currentTarget();
  if (!target) return; // recipe already finished

  if (word.id === target) {
    // Right! Move it into the bowl and tick it on the recipe card.
    state.found.push(word.id);
    button.disabled = true;
    button.classList.add("used");
    document.getElementById("bowl").textContent += word.emoji;
    drawRecipeCard();

    if (currentTarget()) {
      say("Oui ! " + withArticle(word) + " ✓  Maintenant : " + withArticle(getWord(currentTarget())), "good");
    } else {
      say("Oui ! " + withArticle(word) + " ✓", "good");
      clearInterval(state.timerId);
      setTimeout(finishRecipe, 900);
    }
  } else {
    // Wrong: tell the player what they clicked, so they still learn a word,
    // and remember the word they were looking for.
    state.mistakes++;
    if (!state.missed.includes(target)) state.missed.push(target);
    button.classList.remove("shake");
    void button.offsetWidth; // restarts the shake animation
    button.classList.add("shake");
    say("Non ! Ça, c'est " + withArticle(word) + " (" + word.en + "). Trouve : " + withArticle(getWord(target)), "bad");
  }
}

// ---------- Finishing a recipe ----------

function finishRecipe() {
  const seconds = elapsedSeconds();
  const stars = starsFor(state.mistakes, seconds, state.recipe.ingredients.length);
  state.results.push({ recipe: state.recipe, seconds, mistakes: state.mistakes, stars });

  document.getElementById("done-title").textContent =
    "Bravo ! " + capitalize(state.recipe.name) + " : c'est prêt ! " + state.recipe.emoji;
  document.getElementById("done-stars").textContent = starText(stars);
  document.getElementById("done-details").textContent =
    "Temps : " + seconds + " s (objectif : " + targetTime(state.recipe.ingredients.length) + " s) · " +
    (state.mistakes === 0 ? "aucune erreur !" : "erreurs : " + state.mistakes);

  const isLast = state.recipeIndex === state.level.recipes.length - 1;
  document.getElementById("next-button").textContent = isLast ? "Voir le bilan →" : "Recette suivante →";
  showScreen("done-screen");
}

function nextRecipe() {
  if (state.recipeIndex < state.level.recipes.length - 1) {
    state.recipeIndex++;
    startRecipe();
  } else {
    showReport();
  }
}

// ---------- End-of-level report ----------

function showReport() {
  const total = state.results.reduce((sum, r) => sum + r.stars, 0);
  const max = state.results.length * 3;

  // Remember the best score (not for practice rounds).
  if (!state.level.practice) {
    const best = state.bestStars[state.level.id];
    if (best === undefined || total > best) state.bestStars[state.level.id] = total;
  }

  document.getElementById("report-title").textContent = "Bilan : " + state.level.name;
  document.getElementById("report-total").textContent = total + " / " + max + " ★";

  // One row per recipe.
  const recipeRows = document.getElementById("report-recipes");
  recipeRows.innerHTML = "";
  for (const r of state.results) {
    addRow(recipeRows, [r.recipe.emoji + " " + r.recipe.name, r.seconds + " s", String(r.mistakes), starText(r.stars)]);
  }

  // The words to review.
  const missedRows = document.getElementById("report-missed");
  missedRows.innerHTML = "";
  for (const id of state.missed) {
    const word = getWord(id);
    addRow(missedRows, [word.emoji || "", withArticle(word), word.en]);
    missedRows.lastChild.firstChild.className = "emoji";
  }
  document.getElementById("missed-section").hidden = state.missed.length === 0;
  document.getElementById("no-missed").hidden = state.missed.length > 0;
  document.getElementById("practice-button").hidden = state.missed.length === 0;

  showScreen("report-screen");
}

function addRow(tbody, cells) {
  const row = document.createElement("tr");
  for (const text of cells) {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
  }
  tbody.appendChild(row);
}

// A practice round: one "recipe" made of the missed words, played in the same mode.
function startPractice() {
  const ids = state.missed.slice(0, SHELF_SIZE - 1);
  const practice = {
    id: "practice",
    name: "Pratique",
    practice: true,
    mode: state.level.mode,
    recipes: [{ name: "les mots à revoir", emoji: "📝", ingredients: ids }],
    returnTo: state.level.practice ? state.level.returnTo : state.level,
  };
  startLevel(practice);
}

// "Rejouer" replays the real level, even from a practice report.
function replayLevel() {
  startLevel(state.level.practice ? state.level.returnTo : state.level);
}

// ---------- Buttons ----------

document.getElementById("play-button").addEventListener("click", showLevels);
document.getElementById("quit-button").addEventListener("click", () => {
  clearInterval(state.timerId);
  showLevels();
});
document.getElementById("next-button").addEventListener("click", nextRecipe);
document.getElementById("practice-button").addEventListener("click", startPractice);
document.getElementById("replay-level-button").addEventListener("click", replayLevel);
document.getElementById("levels-button").addEventListener("click", showLevels);
document.getElementById("back-title-button").addEventListener("click", () => showScreen("title-screen"));
