// ============================================================
// game.js — runs the game: shows screens, builds the kitchen,
// and reacts to the player.
//
// There are three kinds of level ("modes"):
//   click   Level 1: read the French word, click the matching picture
//   gender  Level 2: click the picture, then pick le / la / l' / les
//   type    Level 3: see the picture (or English word), type the French word
// Level 4 (the menu) mixes them: each course says which mode it uses.
//
// The mini-games (Le Café, falling food, the maze) live in cafe.js, falling.js
// and maze.js. They unlock after Level 1 and use the helpers in this file.
// Collected stars and the chef's clothes are saved by progress.js; the chef
// is drawn by chef.js and dressed in the shop (shop.js).
//
// Uses VOCAB/withArticle/getWord (vocab.js), LEVELS/SHELF_SIZE/pickRecipes (recipes.js),
// targetTime/starsFor/starText (scoring.js), checkTyped/definiteArticle/hiddenGenderTip (check.js)
// and playSound/toggleSound (sound.js).
// ============================================================

// ---------- Game state: everything the game needs to remember ----------
const state = {
  level: null,          // the current level object from LEVELS
  recipes: [],          // the recipes picked for this game of the level
  recipeIndex: 0,       // which recipe of the level we are on
  recipe: null,         // the current recipe object
  mode: "click",        // the mode of the current recipe: click, gender or type
  found: [],            // ids of ingredients already put in the bowl
  mistakes: 0,          // mistakes in this recipe
  tries: 0,             // wrong typed answers for the current word (type mode)
  pendingButton: null,  // gender mode: the picture clicked, waiting for le/la/l'/les
  startTime: 0,         // when this recipe started (milliseconds)
  timerId: null,        // the ticking clock, so we can stop it
  results: [],          // one entry per finished recipe: { recipe, seconds, mistakes, stars }
  missed: [],           // ids of words the player got wrong in this level
  bestModes: {},        // best score per mini-game id (only for this visit)
  modeReplay: null,     // function that restarts the mini-game just played
};

// The mini-games shown under the levels. They open once Level 1 is finished.
const MINI_GAMES = [
  {
    id: "cafe",
    name: "Le Café",
    emoji: "☕",
    color: "#c98b4f",
    goal: "Les clients commandent en français. Sers-les vite ! (Serve customers before they leave.)",
    unit: " €",
    start: () => startCafe(),
  },
  {
    id: "falling",
    name: "La Pluie de Nourriture",
    emoji: "🌧️",
    color: "#5ab8ff",
    goal: "Attrape la nourriture qui tombe ! (Catch the falling food that matches the word.)",
    unit: " mots",
    start: () => startFalling(),
  },
  {
    id: "maze",
    name: "Le Labyrinthe du Chef",
    emoji: "🧑‍🍳",
    color: "#46c35a",
    goal: "Guide le chef dans le labyrinthe et ramasse le bon aliment ! (Steer the chef to the food named at the top.)",
    unit: " mots",
    start: () => startMaze(),
  },
];

// After this many wrong typed answers, the game shows the answer.
const MAX_TRIES = 3;

// ---------- Small helpers ----------

// Shows one screen (a <section>) and hides all the others.
// Arriving at a menu screen sometimes brings a surprise review question (quiz.js).
let currentScreen = "title-screen";
function showScreen(id) {
  for (const screen of document.querySelectorAll("main > section")) {
    screen.hidden = screen.id !== id;
  }
  const from = currentScreen;
  currentScreen = id;
  maybeSurprise(from, id);
}

// Saves one answer to the word's memory (memory.js: spaced repetition).
function remember(wordId, correct) {
  recordAnswer(progress.memory, wordId, correct);
  saveProgress();
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

// All food words that have a picture (not meals or verbs).
function pictureFoods() {
  return VOCAB.filter((word) =>
    word.emoji &&
    !word.categories.includes("meals") &&
    !word.categories.includes("verbs")
  );
}

// Picks random food words with pictures that are NOT in the recipe.
function pickDistractors(recipe, count) {
  const candidates = pictureFoods().filter((word) => !recipe.ingredients.includes(word.id));
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
  box.className = "feedback";
  void box.offsetWidth; // restart the pop animation, even for the same kind of message
  box.className = "feedback " + type;
}

// Draws stars as separate pieces so they can pop in one after another.
function renderStars(element, stars) {
  element.innerHTML = "";
  for (let i = 0; i < MAX_STARS; i++) {
    const star = document.createElement("span");
    star.className = i < stars ? "star on" : "star";
    star.textContent = "★";
    star.style.animationDelay = i * 0.12 + "s";
    element.appendChild(star);
  }
  element.setAttribute("aria-label", stars + " étoiles sur " + MAX_STARS);
}

// Confetti! Stars and food rain down the screen for a moment.
function celebrate() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const symbols = ["⭐", "✨", "🎉", "🍓", "🧀", "🥖", "🍰", "⭐"];
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.textContent = symbols[i % symbols.length];
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.animationDelay = Math.random() * 0.5 + "s";
    piece.style.setProperty("--spin", Math.round(Math.random() * 720 - 360) + "deg");
    piece.style.setProperty("--drift", Math.round(Math.random() * 160 - 80) + "px");
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3000);
  }
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

// The clue for typing: the picture, or the English if there's no picture.
// Some words have a special clue (vocab.js) so the English isn't confusing.
function clueFor(word) {
  return word.emoji || "“" + (word.clue || word.en) + "”";
}

// ---------- Level select ----------

// A level is open if the level before it was finished (saved in progress.js).
function isUnlocked(index) {
  return index === 0 || isFinished(LEVELS[index - 1]);
}

function isFinished(level) {
  return progress.completed[level.id] !== undefined;
}

function showLevels() {
  const list = document.getElementById("level-list");
  list.innerHTML = "";

  LEVELS.forEach((level, index) => {
    const button = document.createElement("button");
    button.className = "level-card";
    button.disabled = !isUnlocked(index);

    let status;
    if (!isUnlocked(index)) status = "🔒 Finis le niveau d'avant (finish the level before)";
    else if (isFinished(level))
      status = "✅ Terminé : " + progress.completed[level.id] + " ★ gagnées (finished; no new stars)";
    else status = level.courses ? "3 plats (3 courses)" : "3 recettes au hasard (3 random recipes)";

    button.innerHTML =
      '<span class="level-badge"><span class="level-emoji"></span></span><span class="level-text"><strong></strong><small class="goal"></small><small class="status"></small></span>';
    button.style.setProperty("--c", level.color); // the level's own color
    button.querySelector(".level-emoji").textContent = level.emoji;
    button.querySelector("strong").textContent = "Niveau " + (index + 1) + " · " + level.name;
    button.querySelector(".goal").textContent = level.goal;
    button.querySelector(".status").textContent = status;
    button.addEventListener("click", () => startLevel(level));
    list.appendChild(button);
  });

  // The mini-games: locked until Level 1 is finished.
  const gamesOpen = isFinished(LEVELS[0]);
  const gameList = document.getElementById("game-list");
  gameList.innerHTML = "";
  for (const game of MINI_GAMES) {
    const button = document.createElement("button");
    button.className = "level-card game-card";
    button.disabled = !gamesOpen;
    let status;
    if (!gamesOpen) status = "🔒 Finis Le Petit-Déjeuner d'abord (finish Level 1 first)";
    else if (state.bestModes[game.id] !== undefined) status = "Record : " + state.bestModes[game.id] + game.unit;
    else status = "Nouveau ! (New!)";

    button.innerHTML =
      '<span class="level-badge"><span class="level-emoji"></span></span><span class="level-text"><strong></strong><small class="goal"></small><small class="status"></small></span>';
    button.style.setProperty("--c", game.color);
    button.querySelector(".level-emoji").textContent = game.emoji;
    button.querySelector("strong").textContent = game.name;
    button.querySelector(".goal").textContent = game.goal;
    button.querySelector(".status").textContent = status;
    button.addEventListener("click", game.start);
    gameList.appendChild(button);
  }

  // The level quizzes (quiz.js): each opens when its level is finished.
  const quizList = document.getElementById("quiz-list");
  quizList.innerHTML = "";
  LEVELS.forEach((level, index) => {
    const words = levelWords(level);
    const mastered = words.filter((id) => masteryOf(wordRecord(progress.memory, id)) === "maîtrisé").length;
    const result = progress.quizzes[level.id];
    const button = document.createElement("button");
    button.className = "level-card quiz-card";
    button.disabled = !isFinished(level);
    let status;
    if (!isFinished(level)) status = "🔒 Finis le niveau " + (index + 1) + " d'abord";
    else if (!result) status = "1er essai : +10 ⭐ si tu réussis (80%), −5 ⭐ sinon";
    else status = "1er essai : " + result.firstScore + "/" + result.total + (result.passedFirst ? " ✓" : " ✗") +
      " · meilleur : " + result.best + "/" + result.total;

    button.innerHTML =
      '<span class="level-badge"><span class="level-emoji">📝</span></span><span class="level-text"><strong></strong><small class="goal"></small><small class="status"></small></span>';
    button.style.setProperty("--c", level.color);
    button.querySelector("strong").textContent = "Quiz · " + level.name;
    button.querySelector(".goal").textContent = words.length + " mots · " + mastered + " maîtrisés (mastered)";
    button.querySelector(".status").textContent = status;
    button.addEventListener("click", () => startQuiz(level));
    quizList.appendChild(button);
  });

  renderChefs();
  showScreen("levels-screen");
}

// ---------- Starting a level and a recipe ----------

function startLevel(level) {
  state.level = level;
  // A new set every time, picked by spaced repetition: recipes with words the
  // player struggles with (or hasn't seen) are more likely than mastered ones.
  state.recipes = level.practice ? level.recipes : pickRecipes(level, (id) => wordWeight(progress.memory, id));
  state.recipeIndex = 0;
  state.results = [];
  state.missed = [];
  startRecipe();
}

function startRecipe() {
  state.recipe = state.recipes[state.recipeIndex];
  // A recipe can have its own mode (Level 4 courses); otherwise it uses the level's mode.
  const mode = state.recipe.mode || state.level.mode;
  state.mode = mode;
  state.found = [];
  state.mistakes = 0;
  state.wrongWords = new Set(); // words missed at least once in this recipe
  state.tries = 0;
  state.pendingButton = null;

  const count = state.recipes.length;
  // Menu courses show their name from the class list: l'entrée, le plat principal, le dessert.
  const step = state.recipe.course ? withArticle(getWord(state.recipe.course)) : "recette";
  document.getElementById("level-name").textContent =
    state.level.name + " · " + step + " " + (state.recipeIndex + 1) + " / " + count;
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

// The clock, plus the order ticket's timer bar that drains like in a busy kitchen.
function startTimer() {
  clearInterval(state.timerId);
  state.startTime = Date.now();
  const clock = document.getElementById("timer");
  const bar = document.getElementById("order-timer-fill");
  const target = targetTime(state.recipe.ingredients.length, state.mode);
  const tick = () => {
    clock.textContent = elapsedSeconds();
    const left = Math.max(0, 1 - (Date.now() - state.startTime) / 1000 / target);
    bar.style.width = left * 100 + "%";
    bar.className = "order-timer-fill" + (left < 0.25 ? " low" : left < 0.55 ? " mid" : "");
  };
  tick();
  state.timerId = setInterval(tick, 250);
}

// Tells the player what to do for the next ingredient.
function askForNext() {
  const word = currentTarget();
  const mode = state.mode;
  // The voice reads the word too, but never gives away the answer:
  // in gender mode it reads the noun without its article, in type mode nothing.
  if (mode === "click") {
    prompt("Trouve : " + withArticle(word));
    speakFrench(withArticle(word), { queue: true });
  }
  if (mode === "gender") {
    prompt("Trouve : " + word.fr);
    speakFrench(word.fr, { queue: true });
  }
  if (mode === "type") {
    forgetVoice();
    state.tries = 0;
    prompt("Écris le mot en français (with le / la / l’ / les if you want) :");
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
      if (state.mode === "click") item.textContent = withArticle(word);
      if (state.mode === "gender") item.textContent = "___ " + word.fr;
      if (state.mode === "type") item.textContent = clueFor(word) + " = ?";
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
// quiet = true skips the "good" sound (used when the game revealed the answer).
function collect(word, quiet = false) {
  if (!quiet) playSound("good");
  // The word counts as "known" only if it was right with no mistake on it.
  if (!state.wrongWords.has(word.id)) remember(word.id, true);
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
  playSound("bad");
  state.mistakes++;
  addMissed(word);
  if (!state.wrongWords.has(word.id)) {
    state.wrongWords.add(word.id);
    remember(word.id, false); // back to box 1: this word will come back soon
  }
}

// ---------- Modes 1 & 2: clicking a picture on the shelf ----------

function pickFood(word, button) {
  const target = currentTarget();
  if (!target || state.pendingButton) return; // finished, or waiting for the article

  if (word.id === target.id) {
    button.disabled = true;
    button.classList.add("used");

    if (state.mode === "click") {
      say("Oui ! " + withArticle(word) + " ✓", "good");
      collect(word);
    } else {
      // Gender mode: right picture, now ask for the article.
      state.pendingButton = button;
      playSound("good");
      say("Oui, c'est ça ! Maintenant : le, la, l' ou les ?", "good");
      prompt("___ " + word.fr + " : le, la, l' ou les ?");
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

// ---------- Mode 2: choosing le / la / l' / les ----------

function showArticleButtons() {
  for (const button of document.querySelectorAll(".article-button")) button.disabled = false;
  document.getElementById("article-area").hidden = false;
}

function pickArticle(choice, button) {
  const word = currentTarget();
  if (!word || !state.pendingButton) return;

  if (choice === definiteArticle(word)) {
    const answer = choice === "l'" ? "l’" + word.fr : choice + " " + word.fr;
    let message = "Oui ! " + answer + " ✓";
    // l' hides the gender, so explain it: "orange est féminin : une orange".
    const tip = hiddenGenderTip(word);
    if (tip) message += " (" + tip + ")";
    say(message, "good");
    speakFrench(answer);
    state.pendingButton = null;
    document.getElementById("article-area").hidden = true;
    collect(word);
  } else {
    mistake(word);
    button.disabled = true;
    const hint = startsWithVowel(word.fr) ? " Indice : " + word.fr + " commence par une voyelle. (Hint: it starts with a vowel.)" : "";
    say("Non, pas « " + (choice === "l'" ? "l’" : choice) + " ». Essaie encore !" + hint, "bad");
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
    speakFrench(withArticle(word));
    collect(word);
  } else if (result === "accent") {
    say("Presque ! N'oublie pas les accents : " + withArticle(word), "warn");
    speakFrench(withArticle(word));
    collect(word);
  } else if (result === "article") {
    say("Oui, mais attention à l'article : " + withArticle(word), "warn");
    speakFrench(withArticle(word));
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
  speakFrench(withArticle(word));
  collect(word, true);
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
  const mode = state.mode;
  const count = state.recipe.ingredients.length;
  const seconds = elapsedSeconds();
  const stars = starsFor(state.mistakes, seconds, count, mode);
  state.results.push({ recipe: state.recipe, seconds, mistakes: state.mistakes, stars });
  playSound("done");

  document.getElementById("done-title").textContent =
    "Bravo ! " + capitalize(state.recipe.name) + " : c'est prêt ! " + state.recipe.emoji;
  renderStars(document.getElementById("done-stars"), stars);
  showChefReaction("done", moodForTotal(stars, MAX_STARS));
  if (stars === MAX_STARS) celebrate();
  document.getElementById("done-details").textContent =
    "Temps : " + seconds + " s (objectif : " + targetTime(count, mode) + " s) · " +
    (state.mistakes === 0 ? "aucune erreur !" : "erreurs : " + state.mistakes);

  const isLast = state.recipeIndex === state.recipes.length - 1;
  const next = state.recipes[state.recipeIndex + 1];
  let label = "Recette suivante →";
  if (isLast) label = "Voir le bilan →";
  else if (next.course) label = "Maintenant : " + withArticle(getWord(next.course)) + " →";
  document.getElementById("next-button").textContent = label;
  showScreen("done-screen");
}

function nextRecipe() {
  if (state.recipeIndex < state.recipes.length - 1) {
    state.recipeIndex++;
    startRecipe();
  } else {
    showReport();
  }
}

// ---------- End-of-level report ----------

function showReport() {
  const total = state.results.reduce((sum, r) => sum + r.stars, 0);
  const max = state.results.length * MAX_STARS;

  // Stars go into the collection only the FIRST time a level is finished (not practice).
  const earnedNote = document.getElementById("report-earned");
  if (state.level.practice) {
    earnedNote.textContent = "";
  } else {
    const added = earnLevelStars(progress, state.level.id, total);
    saveProgress();
    earnedNote.textContent = added > 0
      ? "⭐ +" + added + " étoiles dans ta collection ! Tu en as " + progress.stars + ". (Spend them in the shop!)"
      : "Niveau déjà terminé : pas de nouvelles étoiles. (Already finished: no new stars unless you start over.)";
  }

  document.getElementById("report-title").textContent = "Bilan : " + state.level.name;
  document.getElementById("report-total").textContent = total + " / " + max + " ★";
  showChefReaction("report", moodForTotal(total, max));
  if (moodForTotal(total, max) === 3) celebrate();

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
  document.getElementById("report-quiz-button").hidden = Boolean(state.level.practice);

  showScreen("report-screen");
}

// ---------- Mini-game results (shared by Le Café and falling food) ----------

// result = { id, title, score, scoreText, lines, missed, completed, goal, replay }
// Completing a mini-game gives 1 star, only the first time (like levels).
function showModeResult(result) {
  const starLine = document.getElementById("mode-star");
  if (result.completed) {
    const added = earnLevelStars(progress, "game-" + result.id, 1);
    saveProgress();
    starLine.textContent = added
      ? "⭐ +1 étoile pour ta collection ! (+1 star!)"
      : "Jeu déjà réussi : pas de nouvelle étoile. (Already completed: no new star.)";
    if (added) celebrate();
  } else {
    starLine.textContent = "⭐ Pour gagner une étoile : " + result.goal + ".";
  }

  const best = state.bestModes[result.id];
  const isRecord = best === undefined || result.score > best;
  if (isRecord) state.bestModes[result.id] = result.score;
  state.modeReplay = result.replay;

  document.getElementById("mode-title").textContent = result.title;
  document.getElementById("mode-score").textContent = result.scoreText;
  document.getElementById("mode-record").textContent =
    isRecord && result.score > 0 ? "🏆 Nouveau record ! (New best!)" : "Record : " + state.bestModes[result.id];

  const lines = document.getElementById("mode-lines");
  lines.innerHTML = "";
  for (const text of result.lines) {
    const item = document.createElement("li");
    item.textContent = text;
    lines.appendChild(item);
  }

  const missedRows = document.getElementById("mode-missed");
  missedRows.innerHTML = "";
  for (const id of result.missed) {
    const word = getWord(id);
    addRow(missedRows, [word.emoji || "", withArticle(word), word.en]);
    missedRows.lastChild.firstChild.className = "emoji";
  }
  document.getElementById("mode-missed-section").hidden = result.missed.length === 0;

  showScreen("mode-result-screen");
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
    // Menu practice is typed, since the menu mixes modes and typing works for every word.
    mode: state.level.mode === "menu" ? "type" : state.level.mode,
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
document.getElementById("mode-replay-button").addEventListener("click", () => state.modeReplay());
document.getElementById("mode-levels-button").addEventListener("click", showLevels);

for (const button of document.querySelectorAll(".sound-button")) {
  button.addEventListener("click", toggleSound);
}

// Click Chef Barbe's speech bubble on the title screen to hear him say it.
document.getElementById("title-bubble").addEventListener("click", (event) => {
  speakFrench(frenchPart(event.currentTarget.textContent), { force: true });
});

for (const button of document.querySelectorAll(".article-button")) {
  button.addEventListener("click", () => pickArticle(button.dataset.article, button));
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
