// Checks that every recipe can actually be played.
// Run with:  node --test
const test = require("node:test");
const assert = require("node:assert");
const { getWord } = require("../js/vocab.js");
const { LEVELS, RECIPES_PER_LEVEL, SHELF_SIZE, pickRecipes, allRecipesOf } = require("../js/recipes.js");
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

test("typing clues never give the answer away", () => {
  // A word with no emoji shows its English meaning as the clue,
  // so the English must not be the same as the French (e.g. "sauce").
  const plain = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  for (const { recipe } of allRecipes.filter((r) => r.mode === "type")) {
    for (const id of recipe.ingredients) {
      const word = getWord(id);
      if (!word.emoji) assert.notStrictEqual(plain(word.en), plain(word.fr), `"${id}" clue is the answer`);
    }
  }
});
