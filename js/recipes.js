// ============================================================
// recipes.js — the levels and the recipes inside each level.
//
// Each recipe lists its ingredients by their id from vocab.js.
// Levels 1 and 2 use the picture shelf, so every ingredient there
// MUST have an emoji. Level 3 (typing) can use any word: words with no
// emoji show their English meaning as the clue. The tests check this.
// Level 4 is a menu: each course has its own mode (gender or type)
// and a course name from vocab.js (entree, plat-principal, dessert).
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
    mode: "gender", // click the picture, then pick le / la / les
    recipes: [
      { name: "une salade de fruits", emoji: "🥣", ingredients: ["pomme", "banane", "fraise", "orange", "ananas"] },
      { name: "une coupe glacée", emoji: "🍨", ingredients: ["glace", "cerise", "chocolat", "biscuit"] },
      { name: "un goûter d'anniversaire", emoji: "🎂", ingredients: ["gateau", "bonbons", "lait"] },
    ],
  },
  {
    id: "dejeuner",
    name: "Le Déjeuner",
    emoji: "🍝",
    goal: "Écris le mot en français. (Type the French word.)",
    mode: "type", // see the picture (or English word), type the French word
    recipes: [
      { name: "un sandwich jambon-beurre", emoji: "🥪", ingredients: ["pain", "jambon", "beurre"] },
      { name: "une soupe de légumes", emoji: "🍲", ingredients: ["carotte", "pomme-de-terre", "poireau", "oignon", "celeri"] },
      { name: "des pâtes à la tomate", emoji: "🍝", ingredients: ["pates", "tomate", "ail", "huile-dolive", "fromage"] },
    ],
  },
  {
    id: "diner",
    name: "Le Dîner",
    emoji: "🍽️",
    goal: "L'entrée, le plat principal, le dessert ! (A full menu: articles + typing.)",
    mode: "menu",
    recipes: [
      { course: "entree", mode: "gender", name: "une salade composée", emoji: "🥗",
        ingredients: ["laitue", "tomate", "concombre", "mais", "champignon"] },
      { course: "plat-principal", mode: "type", name: "un poulet rôti aux légumes", emoji: "🍗",
        ingredients: ["poulet", "pomme-de-terre", "haricot", "courgette", "ail"] },
      { course: "dessert", mode: "type", name: "une tarte aux fraises", emoji: "🥧",
        ingredients: ["farine", "beurre", "sucre", "oeuf", "fraise"] },
    ],
  },
];

// How many pictures sit on the kitchen shelf (right ingredients + distractors).
const SHELF_SIZE = 8;

if (typeof module !== "undefined") {
  module.exports = { LEVELS, SHELF_SIZE };
}
