// ============================================================
// recipes.js — the levels and the recipes inside each level.
//
// Each recipe lists its ingredients by their id from vocab.js.
// Level 1 is the picture level ("click" mode), so every ingredient
// there MUST have an emoji. The tests check this automatically.
// A level with no recipes yet shows as "Bientôt" (coming soon).
// ============================================================

const LEVELS = [
  {
    id: "petit-dejeuner",
    name: "Le Petit-Déjeuner",
    emoji: "🥐",
    goal: "Lis le mot, clique sur l'image. (Read the word, click the picture.)",
    mode: "click",
    recipes: [
      { name: "une tartine au miel", emoji: "🍞", ingredients: ["pain", "beurre", "miel"] },
      { name: "un chocolat chaud et un croissant", emoji: "☕", ingredients: ["lait", "chocolat", "croissant"] },
      { name: "une omelette au fromage", emoji: "🍳", ingredients: ["oeuf", "fromage", "beurre", "sel"] },
    ],
  },
  {
    id: "gouter",
    name: "Le Goûter",
    emoji: "🍓",
    goal: "Le, la ou les ? (Pick the right article.)",
    mode: "gender",
    recipes: [], // Milestone 3
  },
  {
    id: "dejeuner",
    name: "Le Déjeuner",
    emoji: "🍝",
    goal: "Écris le mot en français. (Type the French word.)",
    mode: "type",
    recipes: [], // Milestone 3
  },
  {
    id: "diner",
    name: "Le Dîner",
    emoji: "🍽️",
    goal: "Entrée, plat principal, dessert ! (A full menu.)",
    mode: "menu",
    recipes: [], // Milestone 4
  },
];

// How many pictures sit on the kitchen shelf (right ingredients + distractors).
const SHELF_SIZE = 8;

if (typeof module !== "undefined") {
  module.exports = { LEVELS, SHELF_SIZE };
}
