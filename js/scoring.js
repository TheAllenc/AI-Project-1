// ============================================================
// scoring.js — how many stars a recipe earns.
//
// Rules (easy to explain to players):
//   Start with 5 stars.
//   Lose 1 star for each mistake (but never more than 3 for mistakes).
//   Lose 1 star if you were slower than the target time.
//   You always get at least 1 star for finishing.
// ============================================================

// Target time: this many seconds per ingredient, depending on the level type.
// Typing takes longer than clicking, so it gets more time.
const SECONDS_PER_INGREDIENT = {
  click: 6,   // Level 1: click the picture
  gender: 8,  // Level 2: click the picture, then pick le/la/l'/les
  type: 12,   // Level 3: type the French word
};

function targetTime(ingredientCount, mode = "click") {
  return ingredientCount * SECONDS_PER_INGREDIENT[mode];
}

// The most stars one recipe can earn.
const MAX_STARS = 5;

function starsFor(mistakes, seconds, ingredientCount, mode = "click") {
  let stars = MAX_STARS;
  stars -= Math.min(mistakes, 3);
  if (seconds > targetTime(ingredientCount, mode)) stars--;
  return Math.max(1, stars);
}

// Turns a number of stars into a string like "★★★★☆".
function starText(stars) {
  return "★".repeat(stars) + "☆".repeat(MAX_STARS - stars);
}

if (typeof module !== "undefined") {
  module.exports = { SECONDS_PER_INGREDIENT, MAX_STARS, targetTime, starsFor, starText };
}
