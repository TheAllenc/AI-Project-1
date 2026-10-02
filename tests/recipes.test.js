// Checks that every recipe can actually be played.
// Run with:  node --test
const test = require("node:test");
const assert = require("node:assert");
const { getWord } = require("../js/vocab.js");
const { LEVELS, SHELF_SIZE } = require("../js/recipes.js");

test("every recipe ingredient exists in vocab.js", () => {
  for (const level of LEVELS) {
    for (const recipe of level.recipes) {
      for (const id of recipe.ingredients) {
        assert.ok(getWord(id), `"${id}" in ${recipe.name} is not in vocab.js`);
      }
    }
  }
});

test("picture-level ingredients all have an emoji", () => {
  for (const level of LEVELS.filter((l) => l.mode === "click" || l.mode === "gender")) {
    for (const recipe of level.recipes) {
      for (const id of recipe.ingredients) {
        assert.ok(getWord(id).emoji, `"${id}" in ${recipe.name} has no emoji, so it can't be in a picture level`);
      }
    }
  }
});

test("each recipe fits on the shelf with room for distractors", () => {
  for (const level of LEVELS) {
    for (const recipe of level.recipes) {
      assert.ok(recipe.ingredients.length < SHELF_SIZE, `${recipe.name} has too many ingredients`);
      assert.strictEqual(new Set(recipe.ingredients).size, recipe.ingredients.length, `${recipe.name} lists an ingredient twice`);
    }
  }
});

test("gender-level ingredients are nouns (they have a gender)", () => {
  for (const level of LEVELS.filter((l) => l.mode === "gender")) {
    for (const recipe of level.recipes) {
      for (const id of recipe.ingredients) {
        assert.ok(getWord(id).gender, `"${id}" in ${recipe.name} has no gender`);
      }
    }
  }
});

test("typing clues never give the answer away", () => {
  // A word with no emoji shows its English meaning as the clue,
  // so the English must not be the same as the French (e.g. "sauce").
  const plain = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  for (const level of LEVELS.filter((l) => l.mode === "type")) {
    for (const recipe of level.recipes) {
      for (const id of recipe.ingredients) {
        const word = getWord(id);
        if (!word.emoji) assert.notStrictEqual(plain(word.en), plain(word.fr), `"${id}" clue is the answer`);
      }
    }
  }
});
