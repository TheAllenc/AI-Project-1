// Checks the star rules in scoring.js.
// Run with:  node --test
const test = require("node:test");
const assert = require("node:assert");
const { targetTime, starsFor, starText } = require("../js/scoring.js");

test("target time is 6 s per ingredient for clicking, more for harder levels", () => {
  assert.strictEqual(targetTime(3), 18);
  assert.strictEqual(targetTime(4, "click"), 24);
  assert.strictEqual(targetTime(3, "gender"), 24);
  assert.strictEqual(targetTime(3, "type"), 36);
});

test("typing levels use their own target time", () => {
  assert.strictEqual(starsFor(0, 30, 3, "type"), 3);  // 30 s is fine when typing 3 words
  assert.strictEqual(starsFor(0, 30, 3, "click"), 2); // but too slow when clicking
});

test("perfect and fast = 3 stars", () => {
  assert.strictEqual(starsFor(0, 10, 3), 3);
  assert.strictEqual(starsFor(0, 18, 3), 3); // exactly on target still counts
});

test("one or two mistakes = lose 1 star", () => {
  assert.strictEqual(starsFor(1, 10, 3), 2);
  assert.strictEqual(starsFor(2, 10, 3), 2);
});

test("three or more mistakes = lose 2 stars", () => {
  assert.strictEqual(starsFor(3, 10, 3), 1);
});

test("too slow = lose 1 star", () => {
  assert.strictEqual(starsFor(0, 19, 3), 2);
});

test("never less than 1 star", () => {
  assert.strictEqual(starsFor(10, 999, 3), 1);
});

test("starText draws filled and empty stars", () => {
  assert.strictEqual(starText(2), "★★☆");
  assert.strictEqual(starText(3), "★★★");
});
