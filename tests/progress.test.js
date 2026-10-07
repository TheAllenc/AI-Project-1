// Checks the star collection and shop rules in progress.js.
// Run with:  node --test
const test = require("node:test");
const assert = require("node:assert");
const { emptyProgress, earnLevelStars, starsEarned, buyItem, toggleWear, changeStars, recordQuiz } = require("../js/progress.js");
const { CLOTHES } = require("../js/chef.js");

// A cheap hat and a more expensive hat from the shop.
const beret = CLOTHES.find((c) => c.id === "cheese-hat");
const crown = CLOTHES.find((c) => c.id === "cake-hat");

test("stars from a level count only the first time", () => {
  const p = emptyProgress();
  assert.strictEqual(earnLevelStars(p, "gouter", 8), 8);
  assert.strictEqual(earnLevelStars(p, "gouter", 9), 0); // replaying earns nothing
  assert.strictEqual(p.stars, 8);
});

test("the example from the plan: 3 + 2 + 3 = 8 stars", () => {
  const p = emptyProgress();
  earnLevelStars(p, "a", 3);
  earnLevelStars(p, "b", 2);
  earnLevelStars(p, "c", 3);
  assert.strictEqual(p.stars, 8);
  assert.strictEqual(starsEarned(p), 8);
});

test("buying costs stars, puts the item on, and only works once", () => {
  const p = emptyProgress();
  earnLevelStars(p, "a", 9);
  assert.strictEqual(buyItem(p, beret), "ok");
  assert.strictEqual(p.stars, 9 - beret.price);
  assert.strictEqual(p.wearing.hat, "cheese-hat");
  assert.strictEqual(buyItem(p, beret), "owned");
  assert.strictEqual(p.stars, 9 - beret.price);
});

test("you can't buy what you can't afford", () => {
  const p = emptyProgress();
  earnLevelStars(p, "a", 2);
  assert.strictEqual(buyItem(p, crown), "too-expensive");
  assert.strictEqual(p.stars, 2);
  assert.deepStrictEqual(p.owned, []);
});

test("spending stars doesn't let you earn a level's stars again", () => {
  const p = emptyProgress();
  earnLevelStars(p, "a", 9);
  buyItem(p, beret);
  assert.strictEqual(earnLevelStars(p, "a", 9), 0);
  assert.strictEqual(starsEarned(p), 9);
});

test("wearing: one item per slot, and owned items can be taken off", () => {
  const p = emptyProgress();
  earnLevelStars(p, "a", 9);
  earnLevelStars(p, "b", 9);
  buyItem(p, beret);
  buyItem(p, crown);
  assert.strictEqual(p.wearing.hat, "cake-hat"); // the newest hat replaces the old one
  toggleWear(p, crown);
  assert.strictEqual(p.wearing.hat, undefined);
  toggleWear(p, beret);
  assert.strictEqual(p.wearing.hat, "cheese-hat");
});

test("you can't wear an item you don't own", () => {
  const p = emptyProgress();
  toggleWear(p, crown);
  assert.strictEqual(p.wearing.hat, undefined);
});

test("stars never go below 0", () => {
  const p = emptyProgress();
  assert.strictEqual(changeStars(p, -1), 0);
  assert.strictEqual(p.stars, 0);
  changeStars(p, 3);
  assert.strictEqual(changeStars(p, -5), -3);
  assert.strictEqual(p.stars, 0);
});

test("quiz: passing on the first try gives 10 stars, later tries give nothing", () => {
  const p = emptyProgress();
  const first = recordQuiz(p, "gouter", 17, 20); // 85%
  assert.deepStrictEqual(first, { passed: true, first: true, starChange: 10 });
  assert.strictEqual(p.stars, 10);
  const again = recordQuiz(p, "gouter", 20, 20);
  assert.deepStrictEqual(again, { passed: true, first: false, starChange: 0 });
  assert.strictEqual(p.stars, 10);
  assert.strictEqual(p.quizzes.gouter.attempts, 2);
  assert.strictEqual(p.quizzes.gouter.best, 20);
});

test("quiz: failing the first try costs 5 stars (but not below 0), retries cost nothing", () => {
  const p = emptyProgress();
  changeStars(p, 7);
  assert.strictEqual(recordQuiz(p, "diner", 10, 20).starChange, -5); // 50%
  assert.strictEqual(p.stars, 2);
  assert.strictEqual(recordQuiz(p, "diner", 5, 20).starChange, 0);
  const poor = emptyProgress();
  changeStars(poor, 2);
  assert.strictEqual(recordQuiz(poor, "x", 0, 10).starChange, -2);
  assert.strictEqual(poor.stars, 0);
});

test("quiz: 80% is a pass, just under is a fail", () => {
  assert.ok(recordQuiz(emptyProgress(), "a", 8, 10).passed);
  assert.ok(!recordQuiz(emptyProgress(), "a", 7, 10).passed);
});
