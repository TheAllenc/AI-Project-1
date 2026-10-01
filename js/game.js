// ============================================================
// game.js — runs the game: shows screens, builds the kitchen,
// and reacts when the player clicks an ingredient.
// Uses VOCAB/withArticle/getWord (vocab.js) and LEVELS/SHELF_SIZE (recipes.js).
// ============================================================

// ---------- Game state: everything the game needs to remember ----------
const state = {
  level: null,      // the current level object from LEVELS
  recipe: null,     // the current recipe object
  found: [],        // ids of ingredients already put in the bowl
  mistakes: 0,      // wrong clicks in this recipe
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

// Shows a message under the shelf. type is "good" or "bad".
function say(message, type) {
  const box = document.getElementById("feedback");
  box.textContent = message;
  box.className = "feedback " + type;
}

// ---------- Starting a recipe ----------

function startRecipe(level, recipe) {
  state.level = level;
  state.recipe = recipe;
  state.found = [];
  state.mistakes = 0;

  document.getElementById("level-name").textContent = level.name;
  document.getElementById("recipe-name").textContent = recipe.emoji + " " + recipe.name;
  document.getElementById("bowl").textContent = "";
  say("Clique sur les bons ingrédients ! (Click the right ingredients!)", "");

  drawRecipeCard();
  drawShelf();
  showScreen("kitchen-screen");
}

// The recipe card: the list of ingredients in French, ticked when found.
function drawRecipeCard() {
  const list = document.getElementById("recipe-list");
  list.innerHTML = "";
  for (const id of state.recipe.ingredients) {
    const item = document.createElement("li");
    item.textContent = withArticle(getWord(id));
    if (state.found.includes(id)) item.className = "done";
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
  if (state.recipe.ingredients.includes(word.id)) {
    // Right! Move it into the bowl and tick it on the recipe card.
    state.found.push(word.id);
    button.disabled = true;
    button.classList.add("used");
    document.getElementById("bowl").textContent += word.emoji;
    say("Oui ! " + withArticle(word) + " ✓", "good");
    drawRecipeCard();

    if (state.found.length === state.recipe.ingredients.length) {
      setTimeout(finishRecipe, 900);
    }
  } else {
    // Wrong: tell the player what they actually clicked, so they still learn a word.
    state.mistakes++;
    button.classList.remove("shake");
    void button.offsetWidth; // restarts the shake animation
    button.classList.add("shake");
    say("Non ! Ça, c'est " + withArticle(word) + ". (That's " + word.en + ".)", "bad");
  }
}

// ---------- Finishing a recipe ----------

function finishRecipe() {
  document.getElementById("done-title").textContent =
    "Bravo ! " + capitalize(state.recipe.name) + " : c'est prêt ! " + state.recipe.emoji;
  document.getElementById("done-mistakes").textContent =
    state.mistakes === 0
      ? "Parfait — aucune erreur ! (Perfect, no mistakes!)"
      : "Erreurs : " + state.mistakes;
  showScreen("done-screen");
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ---------- Buttons ----------

document.getElementById("play-button").addEventListener("click", () => {
  const level = LEVELS[0];
  startRecipe(level, level.recipes[0]);
});

document.getElementById("replay-button").addEventListener("click", () => {
  startRecipe(state.level, state.recipe);
});

document.getElementById("home-button").addEventListener("click", () => {
  showScreen("title-screen");
});
