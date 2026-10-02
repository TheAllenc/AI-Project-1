// ============================================================
// game.js — runs the game: shows screens, builds the kitchen,
// and reacts to the player.
//
// There are three kinds of level ("modes"):
//   click   Level 1: read the French word, click the matching picture
//   gender  Level 2: click the picture, then pick le / la / les
//   type    Level 3: see the picture (or English word), type the French word
//
// Uses VOCAB/withArticle/getWord (vocab.js), LEVELS/SHELF_SIZE (recipes.js),
// targetTime/starsFor/starText (scoring.js) and checkTyped/genderArticle (check.js).
// ============================================================

// ---------- Game state: everything the game needs to remember ----------
const state = {
  level: null,          // the current level object from LEVELS
  recipeIndex: 0,       // which recipe of the level we are on
  recipe: null,         // the current recipe object
  found: [],            // ids of ingredients already put in the bowl
  mistakes: 0,          // mistakes in this recipe
  tries: 0,             // wrong typed answers for the current word (type mode)
  pendingButton: null,  // gender mode: the picture clicked, waiting for le/la/les
  startTime: 0,         // when this recipe started (milliseconds)
  timerId: null,        // the ticking clock, so we can stop it
  results: [],          // one entry per finished recipe: { recipe, seconds, mistakes, stars }
  missed: [],           // ids of words the player got wrong in this level
  bestStars: {},        // best total stars per level id (only for this visit)
};

// After this many wrong typed answers, the game shows the answer.
const MAX_TRIES = 3;

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

// The instruction line: what to do now.
function prompt(message) {
  document.getElementById("prompt").textContent = message;
}

// The feedback line: how the last answer went. type is "good", "warn", "bad" or "".
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

// The ingredient the player should find now (the first one not found yet).
function currentTarget() {
  const id = state.recipe.ingredients.find((id) => !state.found.includes(id));
  return id ? getWord(id) : null;
}

// Remembers a word for the "words to review" list (only once).
function addMissed(word) {
  if (!state.missed.includes(word.id)) state.missed.push(word.id);
}

// The clue for typing: the picture, or the English word if there's no picture.
function clueFor(word) {
  return word.emoji || "“" + word.en + "”";
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
    else if (!isUnlocked(index)) status = "🔒 Finis le niveau d'avant (finish the level before)";
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
  const mode = state.level.mode;
  state.recipe = state.level.recipes[state.recipeIndex];
  state.found = [];
  state.mistakes = 0;
  state.tries = 0;
  state.pendingButton = null;

  const count = state.level.recipes.length;
  document.getElementById("level-name").textContent =
    state.level.name + " · recette " + (state.recipeIndex + 1) + " / " + count;
  document.getElementById("recipe-name").textContent = state.recipe.emoji + " " + state.recipe.name;
  document.getElementById("target-time").textContent = targetTime(state.recipe.ingredients.length, mode);
  document.getElementById("bowl").innerHTML = "";
  say("", "");

  // Show only the parts of the kitchen this mode uses.
  document.getElementById("shelf-area").hidden = mode === "type";
  document.getElementById("type-area").hidden = mode !== "type";
  document.getElementById("article-area").hidden = true;
  if (mode !== "type") drawShelf();

  drawRecipeCard();
  showScreen("kitchen-screen");
  askForNext();
  startTimer();
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

// Tells the player what to do for the next ingredient.
function askForNext() {
  const word = currentTarget();
  const mode = state.level.mode;
  if (mode === "click") prompt("Trouve : " + withArticle(word));
  if (mode === "gender") prompt("Trouve : " + word.fr);
  if (mode === "type") {
    state.tries = 0;
    prompt("Écris le mot en français (with le / la / les if you want) :");
    const clue = document.getElementById("clue");
    clue.textContent = clueFor(word);
    clue.className = word.emoji ? "clue" : "clue clue-text"; // English clues use smaller letters
    const input = document.getElementById("answer");
    input.value = "";
    input.focus();
  }
}

// The recipe card. Found ingredients are ticked; the current one has an arrow.
// What a not-yet-found line shows depends on the mode, so it never gives the answer away.
function drawRecipeCard() {
  const list = document.getElementById("recipe-list");
  list.innerHTML = "";
  const target = currentTarget();
  for (const id of state.recipe.ingredients) {
    const word = getWord(id);
    const item = document.createElement("li");
    if (state.found.includes(id)) {
      item.textContent = withArticle(word);
      item.className = "done";
    } else {
      if (state.level.mode === "click") item.textContent = withArticle(word);
      if (state.level.mode === "gender") item.textContent = "___ " + word.fr;
      if (state.level.mode === "type") item.textContent = clueFor(word) + " = ?";
      if (target && id === target.id) item.className = "current";
    }
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

// Puts a found ingredient in the bowl, then moves on (or finishes the recipe).
function collect(word) {
  state.found.push(word.id);
  const item = document.createElement("span");
  item.className = word.emoji ? "bowl-item" : "bowl-item bowl-word";
  item.textContent = word.emoji || word.fr;
  document.getElementById("bowl").appendChild(item);
  drawRecipeCard();

  if (currentTarget()) {
    askForNext();
  } else {
    clearInterval(state.timerId);
    prompt("");
    setTimeout(finishRecipe, 1200);
  }
}

// Counts a mistake and remembers the word for the report.
function mistake(word) {
  state.mistakes++;
  addMissed(word);
}

// ---------- Modes 1 & 2: clicking a picture on the shelf ----------

function pickFood(word, button) {
  const target = currentTarget();
  if (!target || state.pendingButton) return; // finished, or waiting for le/la/les

  if (word.id === target.id) {
    button.disabled = true;
    button.classList.add("used");

    if (state.level.mode === "click") {
      say("Oui ! " + withArticle(word) + " ✓", "good");
      collect(word);
    } else {
      // Gender mode: right picture, now ask for the article.
      state.pendingButton = button;
      say("Oui, c'est ça ! Maintenant : le, la ou les ?", "good");
      prompt("___ " + word.fr + " : le, la ou les ?");
      showArticleButtons();
    }
  } else {
    // Wrong: tell the player what they clicked, so they still learn a word.
    mistake(target);
    button.classList.remove("shake");
    void button.offsetWidth; // restarts the shake animation
    button.classList.add("shake");
    say("Non ! Ça, c'est " + withArticle(word) + " (" + word.en + ").", "bad");
  }
}

// ---------- Mode 2: choosing le / la / les ----------

function showArticleButtons() {
  for (const button of document.querySelectorAll(".article-button")) button.disabled = false;
  document.getElementById("article-area").hidden = false;
}

function pickArticle(choice, button) {
  const word = currentTarget();
  if (!word || !state.pendingButton) return;

  if (choice === genderArticle(word)) {
    let message = "Oui ! " + withArticle(word) + " ✓";
    // Words written with l' or un hide their gender, so explain it.
    if (word.article === "l'" || word.article === "un") {
      message += " (" + word.fr + " est " + (word.gender === "m" ? "masculin" : "féminin") + ")";
    }
    say(message, "good");
    state.pendingButton = null;
    document.getElementById("article-area").hidden = true;
    collect(word);
  } else {
    mistake(word);
    button.disabled = true;
    say("Non, pas « " + choice + " ». Essaie encore ! (Try again!)", "bad");
  }
}

// ---------- Mode 3: typing the word ----------

function submitTyped() {
  const word = currentTarget();
  const input = document.getElementById("answer");
  if (!word || input.value.trim() === "") return;

  const result = checkTyped(input.value, word);
  if (result === "correct") {
    say("Oui ! " + withArticle(word) + " ✓", "good");
    collect(word);
  } else if (result === "accent") {
    say("Presque ! N'oublie pas les accents : " + withArticle(word), "warn");
    collect(word);
  } else if (result === "article") {
    say("Oui, mais attention à l'article : " + withArticle(word), "warn");
    collect(word);
  } else {
    mistake(word);
    state.tries++;
    if (state.tries >= MAX_TRIES) {
      revealAnswer(word);
    } else {
      say("Non, essaie encore ! (Try again — " + (MAX_TRIES - state.tries) + " left)", "bad");
      input.select();
    }
  }
}

// "Je ne sais pas" or too many tries: show the answer and move on.
function revealAnswer(word) {
  if (state.tries === 0) mistake(word); // "Je ne sais pas" counts as one mistake
  say("La réponse : " + withArticle(word) + " (" + word.en + ")", "bad");
  collect(word);
}

// Accent buttons type a letter into the box where the cursor is.
function typeLetter(letter) {
  const input = document.getElementById("answer");
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  input.value = input.value.slice(0, start) + letter + input.value.slice(end);
  input.focus();
  input.setSelectionRange(start + letter.length, start + letter.length);
}

// ---------- Finishing a recipe ----------

function finishRecipe() {
  const mode = state.level.mode;
  const count = state.recipe.ingredients.length;
  const seconds = elapsedSeconds();
  const stars = starsFor(state.mistakes, seconds, count, mode);
  state.results.push({ recipe: state.recipe, seconds, mistakes: state.mistakes, stars });

  document.getElementById("done-title").textContent =
    "Bravo ! " + capitalize(state.recipe.name) + " : c'est prêt ! " + state.recipe.emoji;
  document.getElementById("done-stars").textContent = starText(stars);
  document.getElementById("done-details").textContent =
    "Temps : " + seconds + " s (objectif : " + targetTime(count, mode) + " s) · " +
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

for (const button of document.querySelectorAll(".article-button")) {
  button.addEventListener("click", () => pickArticle(button.textContent, button));
}

// The typing form: Enter or "Valider" checks the answer.
document.getElementById("type-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitTyped();
});
document.getElementById("dont-know-button").addEventListener("click", () => {
  const word = currentTarget();
  if (word) revealAnswer(word);
});
for (const button of document.querySelectorAll(".accent-button")) {
  button.addEventListener("click", () => typeLetter(button.textContent));
}
