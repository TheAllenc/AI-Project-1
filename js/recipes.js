// ============================================================
// recipes.js — the levels and the recipes inside each level.
//
// Each recipe lists its ingredients by their id from vocab.js.
// Levels 1–3 have a POOL of recipes; each time you play, the game picks
// 3 of them at random, so every game is a bit different.
// Level 4 is a menu with 3 courses (from vocab.js: entree, plat-principal,
// dessert). Each course has 2 options and the game picks one of each.
//
// Rules the tests check automatically:
//   - Picture modes (click, gender) need an emoji for every ingredient.
//   - Typing mode can use any word: words with no emoji show their English
//     meaning as the clue, so the English must not be the same as the French.
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
      { name: "une assiette de fruits", emoji: "🍽️", ingredients: ["peche", "poire", "raisin", "melon"] },
      { name: "un bol de fruits au miel", emoji: "🥣", ingredients: ["myrtille", "banane", "citron", "miel"] },
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
      { name: "un panier de fruits d'été", emoji: "🧺", ingredients: ["pasteque", "peche", "cerise", "melon"] },
      { name: "un plateau de desserts", emoji: "🍰", ingredients: ["tarte", "creme-caramel", "biscuit", "bonbons", "glace"] },
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
      { name: "un steak-frites", emoji: "🥩", ingredients: ["bifteck", "frites", "moutarde", "sel", "poivre"] },
      { name: "une ratatouille", emoji: "🍆", ingredients: ["aubergine", "courgette", "poivron", "tomate", "oignon"] },
    ],
  },
  {
    id: "diner",
    name: "Le Dîner",
    emoji: "🍽️",
    goal: "L'entrée, le plat principal, le dessert ! (A full menu: articles + typing.)",
    mode: "menu",
    courses: [
      {
        course: "entree", mode: "gender", options: [
          { name: "une salade composée", emoji: "🥗", ingredients: ["laitue", "tomate", "concombre", "mais", "champignon"] },
          { name: "une soupe à l'oignon", emoji: "🍲", ingredients: ["oignon", "beurre", "pain", "fromage"] },
        ],
      },
      {
        course: "plat-principal", mode: "type", options: [
          { name: "un poulet rôti aux légumes", emoji: "🍗", ingredients: ["poulet", "pomme-de-terre", "haricot", "courgette", "ail"] },
          { name: "un canard à l'orange", emoji: "🦆", ingredients: ["canard", "orange", "sucre", "beurre"] },
        ],
      },
      {
        course: "dessert", mode: "type", options: [
          { name: "une tarte aux fraises", emoji: "🥧", ingredients: ["farine", "beurre", "sucre", "oeuf", "fraise"] },
          { name: "une mousse au chocolat", emoji: "🍫", ingredients: ["chocolat", "oeuf", "sucre", "creme"] },
        ],
      },
    ],
  },
];

// How many recipes you cook per level (Levels 1–3).
const RECIPES_PER_LEVEL = 3;

// How many pictures sit on the kitchen shelf (right ingredients + distractors).
const SHELF_SIZE = 8;

// Picks the recipes for one game of a level.
// Menu level: one random option per course. Other levels: 3 random recipes from the pool.
function pickRecipes(level) {
  if (level.courses) {
    return level.courses.map((c) => {
      const option = c.options[Math.floor(Math.random() * c.options.length)];
      return { ...option, course: c.course, mode: c.mode };
    });
  }
  const pool = [...level.recipes];
  const chosen = [];
  while (chosen.length < RECIPES_PER_LEVEL && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    chosen.push(pool.splice(index, 1)[0]); // take it out so it can't be picked twice
  }
  return chosen;
}

// Every recipe that can appear in a level (used for best scores and the tests).
function allRecipesOf(level) {
  if (level.courses) {
    return level.courses.flatMap((c) => c.options.map((o) => ({ ...o, course: c.course, mode: c.mode })));
  }
  return level.recipes;
}

if (typeof module !== "undefined") {
  module.exports = { LEVELS, RECIPES_PER_LEVEL, SHELF_SIZE, pickRecipes, allRecipesOf };
}
