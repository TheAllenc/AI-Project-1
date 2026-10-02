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

// Target time: this many seconds per ingredient.
const SECONDS_PER_INGREDIENT = 6;

function targetTime(ingredientCount) {
  return ingredientCount * SECONDS_PER_INGREDIENT;
}

function starsFor(mistakes, seconds, ingredientCount) {
  let stars = 3;
  if (mistakes >= 1) stars--;
  if (mistakes >= 3) stars--;
  if (seconds > targetTime(ingredientCount)) stars--;
  return Math.max(1, stars);
}

// Turns a number of stars into a string like "★★☆".
function starText(stars) {
  return "★".repeat(stars) + "☆".repeat(3 - stars);
}

if (typeof module !== "undefined") {
  module.exports = { SECONDS_PER_INGREDIENT, targetTime, starsFor, starText };
}
