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
  for (const level of LEVELS.filter((l) => l.mode === "click")) {
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
