// Checks the star rules in scoring.js.
// Run with:  node --test
const test = require("node:test");
const assert = require("node:assert");
const { MAX_STARS, targetTime, starsFor, starText } = require("../js/scoring.js");

test("a recipe is worth up to 5 stars", () => {
  assert.strictEqual(MAX_STARS, 5);
});

test("target time is 6 s per ingredient for clicking, more for harder levels", () => {
  assert.strictEqual(targetTime(3), 18);
  assert.strictEqual(targetTime(4, "click"), 24);
  assert.strictEqual(targetTime(3, "gender"), 24);
  assert.strictEqual(targetTime(3, "type"), 36);
});

test("perfect and fast = 5 stars", () => {
  assert.strictEqual(starsFor(0, 10, 3), 5);
  assert.strictEqual(starsFor(0, 18, 3), 5); // exactly on target still counts
});

test("each mistake costs 1 star, up to 3", () => {
  assert.strictEqual(starsFor(1, 10, 3), 4);
  assert.strictEqual(starsFor(2, 10, 3), 3);
  assert.strictEqual(starsFor(3, 10, 3), 2);
  assert.strictEqual(starsFor(9, 10, 3), 2);
});

test("too slow = lose 1 star", () => {
  assert.strictEqual(starsFor(0, 19, 3), 4);
});

test("typing levels use their own target time", () => {
  assert.strictEqual(starsFor(0, 30, 3, "type"), 5);  // 30 s is fine when typing 3 words
  assert.strictEqual(starsFor(0, 30, 3, "click"), 4); // but too slow when clicking
});

test("never less than 1 star", () => {
  assert.strictEqual(starsFor(10, 999, 3), 1);
});

test("starText draws filled and empty stars", () => {
  assert.strictEqual(starText(3), "★★★☆☆");
  assert.strictEqual(starText(5), "★★★★★");
});
