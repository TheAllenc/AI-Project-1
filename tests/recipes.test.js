// Checks that every recipe can actually be played.
// Run with:  node --test
const test = require("node:test");
const assert = require("node:assert");
const { VOCAB, getWord } = require("../js/vocab.js");
const { LEVELS, RECIPES_PER_LEVEL, SHELF_SIZE, pickRecipes, allRecipesOf, levelWords } = require("../js/recipes.js");
const { SECONDS_PER_INGREDIENT } = require("../js/scoring.js");

// Every recipe with the mode it is actually played in (Level 4 courses have their own).
const allRecipes = LEVELS.flatMap((level) =>
  allRecipesOf(level).map((recipe) => ({ level, recipe, mode: recipe.mode || level.mode }))
);

test("every recipe ingredient exists in vocab.js", () => {
  for (const { recipe } of allRecipes) {
    for (const id of recipe.ingredients) {
      assert.ok(getWord(id), `"${id}" in ${recipe.name} is not in vocab.js`);
    }
  }
});

test("every recipe is played in a mode the game knows", () => {
  for (const { recipe, mode } of allRecipes) {
    assert.ok(SECONDS_PER_INGREDIENT[mode], `${recipe.name} has unknown mode "${mode}"`);
  }
});

test("picture-mode ingredients all have an emoji", () => {
  for (const { recipe, mode } of allRecipes.filter((r) => r.mode === "click" || r.mode === "gender")) {
    for (const id of recipe.ingredients) {
      assert.ok(getWord(id).emoji, `"${id}" in ${recipe.name} has no emoji, so it can't be in a picture level`);
    }
  }
});

test("menu courses use course names from the class list", () => {
  for (const { level, recipe } of allRecipes.filter((r) => r.level.mode === "menu")) {
    assert.ok(getWord(recipe.course), `${recipe.name} in ${level.name} has unknown course "${recipe.course}"`);
  }
});

test("each recipe fits on the shelf with room for distractors", () => {
  for (const { recipe } of allRecipes) {
    assert.ok(recipe.ingredients.length < SHELF_SIZE, `${recipe.name} has too many ingredients`);
    assert.strictEqual(new Set(recipe.ingredients).size, recipe.ingredients.length, `${recipe.name} lists an ingredient twice`);
  }
});

test("each game picks 3 different recipes (or one per course)", () => {
  for (let i = 0; i < 50; i++) {
    for (const level of LEVELS) {
      const picked = pickRecipes(level);
      assert.strictEqual(picked.length, RECIPES_PER_LEVEL, level.name);
      assert.strictEqual(new Set(picked.map((r) => r.name)).size, picked.length, `${level.name} picked a recipe twice`);
      if (level.courses) assert.deepStrictEqual(picked.map((r) => r.course), ["entree", "plat-principal", "dessert"]);
    }
  }
});

test("each level has more recipes than one game uses, so games vary", () => {
  for (const level of LEVELS) {
    assert.ok(allRecipesOf(level).length > RECIPES_PER_LEVEL, `${level.name} needs more recipes`);
  }
});

test("gender-level ingredients are nouns (they have a gender)", () => {
  for (const { recipe } of allRecipes.filter((r) => r.mode === "gender")) {
    for (const id of recipe.ingredients) {
      assert.ok(getWord(id).gender, `"${id}" in ${recipe.name} has no gender`);
    }
  }
});

// The text clue a typing round shows for a word with no emoji.
const textClue = (word) => word.clue || word.en;
const plain = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’']/g, "").toLowerCase();

test("typing clues never give the answer away", () => {
  // A word with no emoji shows English as the clue, so it must not contain
  // the French word (e.g. "dessert" or "sauce" need a description instead).
  for (const { recipe } of allRecipes.filter((r) => r.mode === "type")) {
    for (const id of recipe.ingredients) {
      const word = getWord(id);
      if (!word.emoji) assert.ok(!plain(textClue(word)).includes(plain(word.fr)), `"${id}" clue gives the answer away`);
    }
  }
});

test("no two typed words have the same clue (so each answer is clear)", () => {
  const seen = {};
  for (const { recipe } of allRecipes.filter((r) => r.mode === "type")) {
    for (const id of recipe.ingredients) {
      const word = getWord(id);
      const clue = word.emoji || plain(textClue(word));
      assert.ok(!seen[clue] || seen[clue] === id, `"${id}" and "${seen[clue]}" share the clue "${clue}"`);
      seen[clue] = id;
    }
  }
});

test("EVERY word on the vocabulary list is used in the game", () => {
  const used = new Set(allRecipes.flatMap(({ recipe }) => recipe.ingredients));
  const missing = VOCAB.filter((w) => !used.has(w.id)).map((w) => w.id);
  assert.deepStrictEqual(missing, [], "these words are not in any recipe: " + missing.join(", "));
});

test("replaying favors recipes with words the player struggles with", () => {
  const level = LEVELS[0];
  const target = level.recipes[0]; // pretend the player struggles with this recipe's words
  const weight = (id) => (target.ingredients.includes(id) ? 6 : 0.5); // struggling vs mastered
  let picked = 0;
  for (let i = 0; i < 1000; i++) if (pickRecipes(level, weight).some((r) => r.name === target.name)) picked++;
  // With equal weights it would be picked about 3/5 = 60% of the time.
  assert.ok(picked > 900, "struggling recipe picked " + picked + " / 1000 times");
});

test("mastered recipes still come back sometimes", () => {
  const level = LEVELS[0];
  const easy = level.recipes[1];
  const weight = (id) => (easy.ingredients.includes(id) ? 0.5 : 3);
  let picked = 0;
  for (let i = 0; i < 1000; i++) if (pickRecipes(level, weight).some((r) => r.name === easy.name)) picked++;
  assert.ok(picked > 0 && picked < 600, "mastered recipe picked " + picked + " / 1000 times");
});

test("the 5 level quizzes together cover EVERY word on the list", () => {
  const covered = new Set(LEVELS.flatMap(levelWords));
  const missing = VOCAB.filter((w) => !covered.has(w.id)).map((w) => w.id);
  assert.deepStrictEqual(missing, []);
});
