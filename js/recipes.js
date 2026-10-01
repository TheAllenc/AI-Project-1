// ============================================================
// recipes.js — the levels and the recipes inside each level.
//
// Each recipe lists its ingredients by their id from vocab.js.
// Level 1 is the picture level ("click" mode), so every ingredient
// there MUST have an emoji. The tests check this automatically.
// ============================================================

const LEVELS = [
  {
    id: "petit-dejeuner",
    name: "Le Petit-Déjeuner",
    mode: "click", // read the French word, click the matching picture
    recipes: [
      {
        name: "une tartine au miel",
        emoji: "🍞",
        ingredients: ["pain", "beurre", "miel"],
      },
    ],
  },
];

// How many pictures sit on the kitchen shelf (right ingredients + distractors).
const SHELF_SIZE = 8;

if (typeof module !== "undefined") {
  module.exports = { LEVELS, SHELF_SIZE };
}
