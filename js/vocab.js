// ============================================================
// vocab.js — THE word list for the game.
//
// Source: Lawless French food vocabulary, supplied by Dillon Allen:
//   https://www.lawlessfrench.com/vocabulary/food/
// To add or fix a word, edit this file only.
//
// Each word has:
//   id          unique name used by recipes.js (no accents/spaces)
//   fr          the French word WITHOUT its article
//   article     "le", "la", "l'", "les", "un" — as written on the vocabulary list
//   gender      "m" or "f" (needed because "l'" and "les" hide the gender)
//   plural      true if the word is plural (les ...)
//   en          English meaning (from the vocabulary list)
//   emoji       picture used in the game, or null if no good emoji exists
//               (words with null only appear in typing rounds, with the
//               English word as the clue instead of a picture)
//   categories  which section(s) of the vocabulary list the word is in
//   clue        (optional) the English hint shown in typing rounds when the
//               plain English would confuse players or give the answer away
//               (false friends like "prune", look-alikes like "dessert",
//               or two words with the same English, like the two "toast"s)
//   verify      (optional) a note about something a human must double-check
// ============================================================

const VOCAB = [
  // ---------- Les repas (meals & courses) ----------
  { id: "repas", fr: "repas", article: "le", gender: "m", plural: false, en: "meal", emoji: null, categories: ["meals"] },
  { id: "petit-dejeuner", fr: "petit-déjeuner", article: "le", gender: "m", plural: false, en: "breakfast", emoji: null, categories: ["meals"] },
  { id: "dejeuner", fr: "déjeuner", article: "le", gender: "m", plural: false, en: "lunch", emoji: null, categories: ["meals"] },
  { id: "diner", fr: "dîner", article: "le", gender: "m", plural: false, en: "dinner", emoji: null, categories: ["meals"] },
  { id: "gouter", fr: "goûter", article: "le", gender: "m", plural: false, en: "after-school snack", emoji: null, categories: ["meals"] },
  { id: "hors-doeuvre", fr: "hors d’œuvre", article: "le", gender: "m", plural: false, en: "appetizer, starter", emoji: null, categories: ["meals"], clue: "small bites served before a meal (appetizer)" },
  { id: "entree", fr: "entrée", article: "l'", gender: "f", plural: false, en: "starter", emoji: null, categories: ["meals"], clue: "the first course of a meal (starter)" },
  { id: "soupe", fr: "soupe", article: "la", gender: "f", plural: false, en: "soup", emoji: "🍲", categories: ["meals"] },
  { id: "potage", fr: "potage", article: "le", gender: "m", plural: false, en: "soup", emoji: null, categories: ["meals"], clue: "a smooth, blended vegetable soup" },
  { id: "plat-principal", fr: "plat principal", article: "le", gender: "m", plural: false, en: "main course", emoji: null, categories: ["meals"] },
  { id: "salade", fr: "salade", article: "la", gender: "f", plural: false, en: "salad", emoji: "🥗", categories: ["meals"] },
  { id: "dessert", fr: "dessert", article: "le", gender: "m", plural: false, en: "dessert", emoji: null, categories: ["meals"], clue: "the sweet course at the end of a meal" },
  { id: "cuisine", fr: "cuisine", article: "la", gender: "f", plural: false, en: "kitchen, cooking", emoji: null, categories: ["meals"] },
  { id: "salle-a-manger", fr: "salle à manger", article: "la", gender: "f", plural: false, en: "dining room", emoji: null, categories: ["meals"] },
  { id: "restaurant", fr: "restaurant", article: "le", gender: "m", plural: false, en: "restaurant", emoji: null, categories: ["meals"], clue: "a place where you pay to eat a meal" },

  // ---------- Verbs ----------
  // Verbs have no article or gender.
  { id: "avoir-faim", fr: "avoir faim", article: null, gender: null, plural: false, en: "to be hungry", emoji: null, categories: ["verbs"] },
  { id: "manger", fr: "manger", article: null, gender: null, plural: false, en: "to eat", emoji: null, categories: ["verbs"] },
  { id: "dejeuner-v", fr: "déjeuner", article: null, gender: null, plural: false, en: "to have lunch", emoji: null, categories: ["verbs"] },
  { id: "diner-v", fr: "dîner", article: null, gender: null, plural: false, en: "to have dinner", emoji: null, categories: ["verbs"] },
  { id: "gouter-v", fr: "goûter", article: null, gender: null, plural: false, en: "to taste", emoji: null, categories: ["verbs"] },

  // ---------- Les fruits (m) ----------
  { id: "abricot", fr: "abricot", article: "l'", gender: "m", plural: false, en: "apricot", emoji: null, categories: ["fruits"] },
  { id: "ananas", fr: "ananas", article: "l'", gender: "m", plural: false, en: "pineapple", emoji: "🍍", categories: ["fruits"] },
  { id: "banane", fr: "banane", article: "la", gender: "f", plural: false, en: "banana", emoji: "🍌", categories: ["fruits"] },
  { id: "cerise", fr: "cerise", article: "la", gender: "f", plural: false, en: "cherry", emoji: "🍒", categories: ["fruits"] },
  { id: "citron", fr: "citron", article: "le", gender: "m", plural: false, en: "lemon", emoji: "🍋", categories: ["fruits"] },
  { id: "citron-vert", fr: "citron vert", article: "le", gender: "m", plural: false, en: "lime", emoji: null, categories: ["fruits"] },
  { id: "figue", fr: "figue", article: "la", gender: "f", plural: false, en: "fig", emoji: null, categories: ["fruits"] },
  { id: "fraise", fr: "fraise", article: "la", gender: "f", plural: false, en: "strawberry", emoji: "🍓", categories: ["fruits"] },
  { id: "framboise", fr: "framboise", article: "la", gender: "f", plural: false, en: "raspberry", emoji: null, categories: ["fruits"] },
  { id: "grenade", fr: "grenade", article: "la", gender: "f", plural: false, en: "pomegranate", emoji: null, categories: ["fruits"] },
  { id: "mandarine", fr: "mandarine", article: "la", gender: "f", plural: false, en: "tangerine", emoji: null, categories: ["fruits"] }, // 🍊 is used for l'orange
  { id: "melon", fr: "melon", article: "le", gender: "m", plural: false, en: "melon", emoji: "🍈", categories: ["fruits"] },
  { id: "mure", fr: "mûre", article: "la", gender: "f", plural: false, en: "blackberry", emoji: null, categories: ["fruits"] },
  { id: "myrtille", fr: "myrtille", article: "la", gender: "f", plural: false, en: "blueberry", emoji: "🫐", categories: ["fruits"] },
  { id: "orange", fr: "orange", article: "l'", gender: "f", plural: false, en: "orange", emoji: "🍊", categories: ["fruits"] },
  { id: "pamplemousse", fr: "pamplemousse", article: "le", gender: "m", plural: false, en: "grapefruit", emoji: null, categories: ["fruits"] },
  { id: "pasteque", fr: "pastèque", article: "la", gender: "f", plural: false, en: "watermelon", emoji: "🍉", categories: ["fruits"] },
  { id: "peche", fr: "pêche", article: "la", gender: "f", plural: false, en: "peach", emoji: "🍑", categories: ["fruits"] },
  { id: "poire", fr: "poire", article: "la", gender: "f", plural: false, en: "pear", emoji: "🍐", categories: ["fruits"] },
  { id: "pomme", fr: "pomme", article: "la", gender: "f", plural: false, en: "apple", emoji: "🍎", categories: ["fruits"] },
  { id: "prune", fr: "prune", article: "la", gender: "f", plural: false, en: "plum", emoji: null, categories: ["fruits"], clue: "plum (careful: not a dried one!)" },
  { id: "pruneau", fr: "pruneau", article: "le", gender: "m", plural: false, en: "prune", emoji: null, categories: ["fruits"], clue: "a dried plum" },
  { id: "raisin", fr: "raisin", article: "le", gender: "m", plural: false, en: "grape", emoji: "🍇", categories: ["fruits"] },
  { id: "raisin-sec", fr: "raisin sec", article: "le", gender: "m", plural: false, en: "raisin", emoji: null, categories: ["fruits"], clue: "a dried grape" },

  // ---------- Les légumes (m) ----------
  { id: "ail", fr: "ail", article: "l'", gender: "m", plural: false, en: "garlic", emoji: "🧄", categories: ["vegetables"] },
  { id: "artichaut", fr: "artichaut", article: "l'", gender: "m", plural: false, en: "artichoke", emoji: null, categories: ["vegetables"] },
  { id: "asperges", fr: "asperges", article: "les", gender: "f", plural: true, en: "asparagus", emoji: null, categories: ["vegetables"] },
  { id: "aubergine", fr: "aubergine", article: "l'", gender: "f", plural: false, en: "eggplant", emoji: "🍆", categories: ["vegetables"] },
  { id: "betterave", fr: "betterave", article: "la", gender: "f", plural: false, en: "beet", emoji: null, categories: ["vegetables"] },
  { id: "carotte", fr: "carotte", article: "la", gender: "f", plural: false, en: "carrot", emoji: "🥕", categories: ["vegetables"] },
  { id: "celeri", fr: "céleri", article: "le", gender: "m", plural: false, en: "celery", emoji: null, categories: ["vegetables"] },
  { id: "champignon", fr: "champignon", article: "le", gender: "m", plural: false, en: "mushroom", emoji: "🍄", categories: ["vegetables"] },
  { id: "chou-fleur", fr: "chou-fleur", article: "le", gender: "m", plural: false, en: "cauliflower", emoji: null, categories: ["vegetables"] },
  { id: "citrouille", fr: "citrouille", article: "la", gender: "f", plural: false, en: "pumpkin (round)", emoji: "🎃", categories: ["vegetables"] },
  { id: "concombre", fr: "concombre", article: "le", gender: "m", plural: false, en: "cucumber", emoji: "🥒", categories: ["vegetables"] },
  { id: "courge", fr: "courge", article: "la", gender: "f", plural: false, en: "squash", emoji: null, categories: ["vegetables"] },
  { id: "courgette", fr: "courgette", article: "la", gender: "f", plural: false, en: "zucchini", emoji: null, categories: ["vegetables"] }, // 🥒 is used for le concombre
  { id: "epinards", fr: "épinards", article: "les", gender: "m", plural: true, en: "spinach", emoji: null, categories: ["vegetables"] },
  { id: "haricot", fr: "haricot", article: "le", gender: "m", plural: false, en: "bean", emoji: "🫘", categories: ["vegetables"] },
  { id: "igname", fr: "igname", article: "l'", gender: "f", plural: false, en: "yam", emoji: null, categories: ["vegetables"] },
  { id: "laitue", fr: "laitue", article: "la", gender: "f", plural: false, en: "lettuce", emoji: "🥬", categories: ["vegetables"] },
  { id: "oignon", fr: "oignon", article: "l'", gender: "m", plural: false, en: "onion", emoji: "🧅", categories: ["vegetables"] },
  { id: "mais", fr: "maïs", article: "le", gender: "m", plural: false, en: "corn", emoji: "🌽", categories: ["vegetables"] },
  { id: "patate-douce", fr: "patate douce", article: "la", gender: "f", plural: false, en: "sweet potato", emoji: "🍠", categories: ["vegetables"] },
  { id: "petits-pois", fr: "petits pois", article: "les", gender: "m", plural: true, en: "peas", emoji: null, categories: ["vegetables"] },
  { id: "poireau", fr: "poireau", article: "le", gender: "m", plural: false, en: "leek", emoji: null, categories: ["vegetables"] },
  { id: "poivron", fr: "poivron", article: "le", gender: "m", plural: false, en: "bell pepper", emoji: "🫑", categories: ["vegetables"] },
  { id: "pomme-de-terre", fr: "pomme de terre", article: "la", gender: "f", plural: false, en: "potato", emoji: "🥔", categories: ["vegetables"] },
  { id: "potiron", fr: "potiron", article: "le", gender: "m", plural: false, en: "pumpkin (oval, somewhat flat)", emoji: null, categories: ["vegetables"], clue: "a big, flat, oval pumpkin" }, // 🎃 is used for la citrouille
  { id: "radis", fr: "radis", article: "le", gender: "m", plural: false, en: "radish", emoji: null, categories: ["vegetables"], clue: "a small, red, crunchy root vegetable" },
  { id: "roquette", fr: "roquette", article: "la", gender: "f", plural: false, en: "arugula", emoji: null, categories: ["vegetables"] },
  { id: "tomate", fr: "tomate", article: "la", gender: "f", plural: false, en: "tomato", emoji: "🍅", categories: ["vegetables"] },

  // ---------- Les produits laitiers ----------
  { id: "babeurre", fr: "babeurre", article: "le", gender: "m", plural: false, en: "buttermilk", emoji: null, categories: ["dairy"] },
  { id: "beurre", fr: "beurre", article: "le", gender: "m", plural: false, en: "butter", emoji: "🧈", categories: ["dairy"] },
  { id: "creme", fr: "crème", article: "la", gender: "f", plural: false, en: "cream", emoji: null, categories: ["dairy"] },
  { id: "creme-fraiche", fr: "crème fraîche", article: "la", gender: "f", plural: false, en: "slightly sour thick cream", emoji: null, categories: ["dairy"] },
  // le fromage and la glace are on the list twice (dairy AND dessert), so they get both categories.
  { id: "fromage", fr: "fromage", article: "le", gender: "m", plural: false, en: "cheese", emoji: "🧀", categories: ["dairy", "dessert"] },
  { id: "fromage-blanc", fr: "fromage blanc", article: "le", gender: "m", plural: false, en: "~ cream cheese", emoji: null, categories: ["dairy"] },
  { id: "glace", fr: "glace", article: "la", gender: "f", plural: false, en: "ice cream", emoji: "🍨", categories: ["dairy", "dessert"] },
  { id: "lait", fr: "lait", article: "le", gender: "m", plural: false, en: "milk", emoji: "🥛", categories: ["dairy"] },
  { id: "yaourt", fr: "yaourt", article: "le", gender: "m", plural: false, en: "yogurt", emoji: null, categories: ["dairy"] },

  // ---------- La viande ----------
  { id: "agneau", fr: "agneau", article: "l'", gender: "m", plural: false, en: "lamb", emoji: null, categories: ["meat"] },
  { id: "anchois", fr: "anchois", article: "les", gender: "m", plural: true, en: "anchovies", emoji: null, categories: ["meat"] },
  { id: "bifteck", fr: "bifteck", article: "le", gender: "m", plural: false, en: "steak", emoji: "🥩", categories: ["meat"] },
  { id: "canard", fr: "canard", article: "le", gender: "m", plural: false, en: "duck", emoji: "🦆", categories: ["meat"] },
  { id: "dinde", fr: "dinde", article: "la", gender: "f", plural: false, en: "turkey", emoji: "🦃", categories: ["meat"] },
  { id: "escargots", fr: "escargots", article: "les", gender: "m", plural: true, en: "snails", emoji: "🐌", categories: ["meat"] },
  { id: "jambon", fr: "jambon", article: "le", gender: "m", plural: false, en: "ham", emoji: null, categories: ["meat"] },
  { id: "lapin", fr: "lapin", article: "le", gender: "m", plural: false, en: "rabbit", emoji: "🐇", categories: ["meat"] },
  { id: "poisson", fr: "poisson", article: "le", gender: "m", plural: false, en: "fish", emoji: "🐟", categories: ["meat"] },
  { id: "porc", fr: "porc", article: "le", gender: "m", plural: false, en: "pork", emoji: null, categories: ["meat"] },
  { id: "poulet", fr: "poulet", article: "le", gender: "m", plural: false, en: "chicken", emoji: "🍗", categories: ["meat"] },
  { id: "rosbif", fr: "rosbif", article: "le", gender: "m", plural: false, en: "roast beef", emoji: null, categories: ["meat"] },
  { id: "saucisson", fr: "saucisson", article: "le", gender: "m", plural: false, en: "sausage", emoji: null, categories: ["meat"] },
  { id: "veau", fr: "veau", article: "le", gender: "m", plural: false, en: "veal", emoji: null, categories: ["meat"] },

  // ---------- Le dessert ----------
  { id: "biscuit", fr: "biscuit", article: "le", gender: "m", plural: false, en: "cookie", emoji: "🍪", categories: ["dessert"] },
  { id: "bonbons", fr: "bonbons", article: "les", gender: "m", plural: true, en: "candy", emoji: "🍬", categories: ["dessert"] },
  { id: "chocolat", fr: "chocolat", article: "le", gender: "m", plural: false, en: "chocolate", emoji: "🍫", categories: ["dessert"] },
  { id: "creme-brulee", fr: "crème brûlée", article: "la", gender: "f", plural: false, en: "custard w/ burnt sugar", emoji: null, categories: ["dessert"], clue: "a custard with a crunchy burnt-sugar top" },
  { id: "creme-caramel", fr: "crème caramel", article: "la", gender: "f", plural: false, en: "flan", emoji: "🍮", categories: ["dessert"] },
  { id: "fruits", fr: "fruits", article: "les", gender: "m", plural: true, en: "fruit", emoji: null, categories: ["dessert"], clue: "fruit, in general (plural)" },
  { id: "gateau", fr: "gâteau", article: "le", gender: "m", plural: false, en: "cake", emoji: "🍰", categories: ["dessert"] },
  { id: "mousse-au-chocolat", fr: "mousse au chocolat", article: "la", gender: "f", plural: false, en: "chocolate mousse", emoji: null, categories: ["dessert"] },
  { id: "tarte", fr: "tarte", article: "la", gender: "f", plural: false, en: "pie", emoji: "🥧", categories: ["dessert"] },
  { id: "vanille", fr: "vanille", article: "la", gender: "f", plural: false, en: "vanilla", emoji: null, categories: ["dessert"] },

  // ---------- Et cetera ----------
  { id: "confiture", fr: "confiture", article: "la", gender: "f", plural: false, en: "jam", emoji: null, categories: ["other"] },
  { id: "croissant", fr: "croissant", article: "le", gender: "m", plural: false, en: "croissant", emoji: "🥐", categories: ["other"] },
  { id: "farine", fr: "farine", article: "la", gender: "f", plural: false, en: "flour", emoji: null, categories: ["other"] },
  { id: "frites", fr: "frites", article: "les", gender: "f", plural: true, en: "fries / chips", emoji: "🍟", categories: ["other"],
    verify: "Class list says 'chips' (British English for fries). Shown as 'fries / chips'." },
  { id: "huile-dolive", fr: "huile d’olive", article: "l'", gender: "f", plural: false, en: "olive oil", emoji: null, categories: ["other"] },
  { id: "mayonnaise", fr: "mayonnaise", article: "la", gender: "f", plural: false, en: "mayonnaise", emoji: null, categories: ["other"], clue: "a creamy white spread made from egg yolk and oil" },
  { id: "miel", fr: "miel", article: "le", gender: "m", plural: false, en: "honey", emoji: "🍯", categories: ["other"] },
  { id: "moutarde", fr: "moutarde", article: "la", gender: "f", plural: false, en: "mustard", emoji: null, categories: ["other"] },
  { id: "oeuf", fr: "œuf", article: "un", gender: "m", plural: false, en: "egg (des œufs = eggs)", emoji: "🥚", categories: ["other"] },
  { id: "pain", fr: "pain", article: "le", gender: "m", plural: false, en: "bread", emoji: "🥖", categories: ["other"] },
  { id: "pain-grille", fr: "pain grillé", article: "le", gender: "m", plural: false, en: "toast", emoji: null, categories: ["other"], clue: "bread browned in a toaster" },
  { id: "pate-a-tartiner", fr: "pâte à tartiner", article: "la", gender: "f", plural: false, en: "~ toast spread, like Nutella or peanut butter", emoji: null, categories: ["other"], clue: "a sweet spread, like Nutella" },
  { id: "pates", fr: "pâtes", article: "les", gender: "f", plural: true, en: "pasta", emoji: "🍝", categories: ["other"] },
  { id: "poivre", fr: "poivre", article: "le", gender: "m", plural: false, en: "pepper", emoji: null, categories: ["other"] },
  { id: "riz", fr: "riz", article: "le", gender: "m", plural: false, en: "rice", emoji: "🍚", categories: ["other"] },
  { id: "sauce", fr: "sauce", article: "la", gender: "f", plural: false, en: "sauce, dressing, gravy", emoji: null, categories: ["other"], clue: "a liquid poured on food (dressing, gravy)" },
  { id: "sel", fr: "sel", article: "le", gender: "m", plural: false, en: "salt", emoji: "🧂", categories: ["other"] },
  { id: "sucre", fr: "sucre", article: "le", gender: "m", plural: false, en: "sugar", emoji: null, categories: ["other"] },
  { id: "tartine", fr: "tartine", article: "la", gender: "f", plural: false, en: "toast", emoji: null, categories: ["other"], clue: "a slice of bread with butter or jam on it",
    verify: "Class list says 'toast' for both le pain grillé and la tartine. A tartine is usually a slice of bread with a spread — keep as 'toast'?" },
];

// Readable names for each category (used on screens).
const CATEGORY_NAMES = {
  meals: "Les repas",
  verbs: "Les verbes",
  fruits: "Les fruits",
  vegetables: "Les légumes",
  dairy: "Les produits laitiers",
  meat: "La viande",
  dessert: "Le dessert",
  other: "Et cetera",
};

// Shows a word with its article, e.g. "la pomme", "l’orange", "les pâtes", "un œuf".
function withArticle(word) {
  if (!word.article) return word.fr;
  if (word.article === "l'") return "l’" + word.fr;
  return word.article + " " + word.fr;
}

// Finds a word by its id. Returns undefined if the id doesn't exist.
function getWord(id) {
  return VOCAB.find((word) => word.id === id);
}

// Lets Node (the test runner) load this file too. Browsers ignore this.
if (typeof module !== "undefined") {
  module.exports = { VOCAB, CATEGORY_NAMES, withArticle, getWord };
}
