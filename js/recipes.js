// ============================================================
// recipes.js — the levels and the recipes inside each level.
//
// Each recipe lists its ingredients by their id from vocab.js.
// Levels 1–3 have a POOL of recipes; each time you play, the game picks
// 3 of them at random, so every game is a bit different.
// Level 4 is a menu with 3 courses (from vocab.js: entree, plat-principal,
// dessert). Each course has several options and the game picks one of each.
// Level 5 is "Le Restaurant": the meal words, the verbs, and more dishes.
//
// EVERY word in vocab.js appears in at least one recipe (a test checks this).
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
    color: "#ffc93c", // the level's color on the level select screen
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
    color: "#ff7eb6",
    goal: "Le, la, l’ ou les ? (Pick the right article.)",
    mode: "gender", // click the picture, then pick le / la / l' / les
    recipes: [
      { name: "une salade de fruits", emoji: "🥣", ingredients: ["pomme", "banane", "fraise", "orange", "ananas"] },
      { name: "une coupe glacée", emoji: "🍨", ingredients: ["glace", "cerise", "chocolat", "biscuit"] },
      { name: "un goûter d'anniversaire", emoji: "🎂", ingredients: ["gateau", "bonbons", "lait"] },
      { name: "un panier de fruits d'été", emoji: "🧺", ingredients: ["pasteque", "peche", "cerise", "melon"] },
      { name: "un plateau de desserts", emoji: "🍰", ingredients: ["tarte", "creme-caramel", "biscuit", "bonbons", "glace"] },
      { name: "un goûter d'automne", emoji: "🍂", ingredients: ["citrouille", "patate-douce", "pomme", "raisin"] },
    ],
  },
  {
    id: "dejeuner",
    name: "Le Déjeuner",
    emoji: "🍝",
    color: "#1fb5a8",
    goal: "Écris le mot en français. (Type the French word.)",
    mode: "type", // see the picture (or English word), type the French word
    recipes: [
      { name: "un sandwich jambon-beurre", emoji: "🥪", ingredients: ["pain", "jambon", "beurre"] },
      { name: "une soupe de légumes", emoji: "🍲", ingredients: ["carotte", "pomme-de-terre", "poireau", "oignon", "celeri"] },
      { name: "des pâtes à la tomate", emoji: "🍝", ingredients: ["pates", "tomate", "ail", "huile-dolive", "fromage"] },
      { name: "un steak-frites", emoji: "🥩", ingredients: ["bifteck", "frites", "moutarde", "sel", "poivre"] },
      { name: "une ratatouille", emoji: "🍆", ingredients: ["aubergine", "courgette", "poivron", "tomate", "oignon"] },
      { name: "une salade niçoise", emoji: "🥗", ingredients: ["anchois", "tomate", "oeuf", "laitue", "huile-dolive"] },
      { name: "une salade du jardin", emoji: "🌱", ingredients: ["roquette", "epinards", "radis", "betterave", "asperges"] },
      { name: "un gratin de légumes", emoji: "🧀", ingredients: ["chou-fleur", "courge", "potiron", "igname", "petits-pois", "artichaut"] },
      { name: "un buffet de viandes froides", emoji: "🍖", ingredients: ["rosbif", "porc", "veau", "agneau", "saucisson", "mayonnaise"] },
    ],
  },
  {
    id: "diner",
    name: "Le Dîner",
    emoji: "🍽️",
    color: "#8e5cf7",
    goal: "L'entrée, le plat principal, le dessert ! (A full menu: articles + typing.)",
    mode: "menu",
    courses: [
      {
        course: "entree", mode: "gender", options: [
          { name: "une salade composée", emoji: "🥗", ingredients: ["laitue", "tomate", "concombre", "mais", "champignon"] },
          { name: "une soupe à l'oignon", emoji: "🍲", ingredients: ["oignon", "beurre", "pain", "fromage"] },
          { name: "des escargots au beurre", emoji: "🐌", ingredients: ["escargots", "beurre", "ail", "pain"] },
        ],
      },
      {
        course: "plat-principal", mode: "type", options: [
          { name: "un poulet rôti aux légumes", emoji: "🍗", ingredients: ["poulet", "pomme-de-terre", "haricot", "courgette", "ail"] },
          { name: "un canard à l'orange", emoji: "🦆", ingredients: ["canard", "orange", "sucre", "beurre"] },
          { name: "un lapin à la moutarde", emoji: "🐇", ingredients: ["lapin", "moutarde", "creme-fraiche", "oignon", "champignon"] },
          { name: "un poisson au riz", emoji: "🐟", ingredients: ["poisson", "riz", "citron-vert", "sauce", "poivre"] },
          { name: "une dinde rôtie", emoji: "🦃", ingredients: ["dinde", "patate-douce", "petits-pois", "beurre", "sel"] },
        ],
      },
      {
        course: "dessert", mode: "type", options: [
          { name: "une tarte aux fraises", emoji: "🥧", ingredients: ["farine", "beurre", "sucre", "oeuf", "fraise"] },
          { name: "une mousse au chocolat", emoji: "🍫", ingredients: ["chocolat", "oeuf", "sucre", "creme"] },
          { name: "une crème brûlée", emoji: "🍮", ingredients: ["creme", "oeuf", "sucre", "vanille"] },
          { name: "le chariot des desserts", emoji: "🛒", ingredients: ["creme-brulee", "mousse-au-chocolat", "fruits", "gateau", "glace"] },
        ],
      },
    ],
  },
  {
    id: "restaurant",
    name: "Le Restaurant",
    emoji: "🍷",
    color: "#ff5a3c",
    goal: "Les repas, la carte et les verbes ! (Meals, the menu and verbs: typing.)",
    mode: "type",
    recipes: [
      { name: "les repas de la journée", emoji: "🕗", ingredients: ["petit-dejeuner", "dejeuner", "gouter", "diner", "repas"] },
      { name: "la carte du restaurant", emoji: "📜", ingredients: ["hors-doeuvre", "entree", "plat-principal", "dessert", "soupe", "salade"] },
      { name: "J'ai faim ! (les verbes)", emoji: "😋", ingredients: ["avoir-faim", "manger", "dejeuner-v", "diner-v", "gouter-v"] },
      { name: "à la maison et au restaurant", emoji: "🏠", ingredients: ["cuisine", "salle-a-manger", "restaurant", "potage", "sauce"] },
      { name: "un petit-déjeuner à la française", emoji: "🥐", ingredients: ["tartine", "pain-grille", "confiture", "pate-a-tartiner", "beurre"] },
      { name: "une compote de fruits", emoji: "🫙", ingredients: ["abricot", "prune", "pruneau", "raisin-sec", "framboise", "mure"] },
      { name: "une salade de fruits d'hiver", emoji: "🍊", ingredients: ["mandarine", "pamplemousse", "grenade", "figue", "citron-vert"] },
      { name: "des crêpes au babeurre", emoji: "🥞", ingredients: ["babeurre", "farine", "oeuf", "sucre", "beurre"] },
      { name: "un bol de yaourt", emoji: "🥛", ingredients: ["yaourt", "fromage-blanc", "miel", "myrtille"] },
    ],
  },
];

// How many recipes you cook per level (Levels 1–3).
const RECIPES_PER_LEVEL = 3;

// How many pictures sit on the kitchen shelf (right ingredients + distractors).
const SHELF_SIZE = 8;

// How much a recipe "needs practice": the average weight of its words.
// wordWeight(id) comes from memory.js (struggling and due words weigh most).
function recipeWeight(recipe, wordWeight) {
  return recipe.ingredients.reduce((sum, id) => sum + wordWeight(id), 0) / recipe.ingredients.length;
}

// Picks the recipes for one game of a level.
// Recipes full of words the player struggles with (or hasn't seen) are MORE
// likely; recipes full of mastered words are LESS likely (but still possible).
// Menu level: one option per course. Other levels: 3 different recipes.
// Without a wordWeight, every recipe is equally likely.
function pickRecipes(level, wordWeight = () => 1, random = Math.random) {
  const weightOf = (recipe) => recipeWeight(recipe, wordWeight);
  if (level.courses) {
    return level.courses.map((c) => {
      const option = pickWeighted(c.options, weightOf, 1, random)[0];
      return { ...option, course: c.course, mode: c.mode };
    });
  }
  return pickWeighted(level.recipes, weightOf, RECIPES_PER_LEVEL, random);
}

// Every word a level uses, in all of its recipes (used for the level quiz).
function levelWords(level) {
  return [...new Set(allRecipesOf(level).flatMap((recipe) => recipe.ingredients))];
}

// Every recipe that can appear in a level (used for best scores and the tests).
function allRecipesOf(level) {
  if (level.courses) {
    return level.courses.flatMap((c) => c.options.map((o) => ({ ...o, course: c.course, mode: c.mode })));
  }
  return level.recipes;
}

if (typeof module !== "undefined") {
  // In the tests, pickWeighted comes from memory.js (in the browser it's already loaded).
  globalThis.pickWeighted = globalThis.pickWeighted || require("./memory.js").pickWeighted;
  module.exports = { LEVELS, RECIPES_PER_LEVEL, SHELF_SIZE, pickRecipes, allRecipesOf, recipeWeight, levelWords };
}
