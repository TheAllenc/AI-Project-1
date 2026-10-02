// ============================================================
// scoring.js — how many stars a recipe earns.
//
// Rules (easy to explain to players):
//   Start with 3 stars.
//   Lose 1 star if you made any mistake.
//   Lose 1 more star if you made 3 or more mistakes.
//   Lose 1 star if you were slower than the target time.
//   You always get at least 1 star for finishing.
// ============================================================

// Target time: this many seconds per ingredient, depending on the level type.
// Typing takes longer than clicking, so it gets more time.
const SECONDS_PER_INGREDIENT = {
  click: 6,   // Level 1: click the picture
  gender: 8,  // Level 2: click the picture, then pick le/la/les
  type: 12,   // Level 3: type the French word
};

function targetTime(ingredientCount, mode = "click") {
  return ingredientCount * SECONDS_PER_INGREDIENT[mode];
}

function starsFor(mistakes, seconds, ingredientCount, mode = "click") {
  let stars = 3;
  if (mistakes >= 1) stars--;
  if (mistakes >= 3) stars--;
  if (seconds > targetTime(ingredientCount, mode)) stars--;
  return Math.max(1, stars);
}

// Turns a number of stars into a string like "★★☆".
function starText(stars) {
  return "★".repeat(stars) + "☆".repeat(3 - stars);
}

if (typeof module !== "undefined") {
  module.exports = { SECONDS_PER_INGREDIENT, targetTime, starsFor, starText };
}
