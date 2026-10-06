// Checks the chef's clothes and messages in chef.js.
// Run with:  node --test
const test = require("node:test");
const assert = require("node:assert");
const { CLOTHES, SLOT_NAMES, CLOTHES_SVG, drawChef, chefSays, moodForTotal } = require("../js/chef.js");

test("every clothing item has a unique id, a known slot, a price and a drawing", () => {
  const ids = CLOTHES.map((c) => c.id);
  assert.strictEqual(new Set(ids).size, ids.length);
  for (const item of CLOTHES) {
    assert.ok(SLOT_NAMES[item.slot], `${item.id} has unknown slot ${item.slot}`);
    assert.ok(item.price > 0, `${item.id} needs a price`);
    assert.ok(CLOTHES_SVG[item.id], `${item.id} has no drawing`);
  }
});

test("the shop costs more than a player can earn, so players must choose", () => {
  const maxStars = 4 * 9; // 4 levels, 9 stars each
  const total = CLOTHES.reduce((sum, c) => sum + c.price, 0);
  assert.ok(total > maxStars);
  assert.ok(CLOTHES.some((c) => c.price <= 3), "something should be cheap enough to buy after one level");
});

test("drawChef shows the clothes being worn", () => {
  assert.ok(drawChef({}).includes("<svg"));
  assert.ok(drawChef({ hat: "crown" }).includes(CLOTHES_SVG.crown));
  assert.ok(!drawChef({ hat: "crown" }).includes(CLOTHES_SVG.toque)); // the crown replaces the chef's hat
});

test("the chef's message matches the stars", () => {
  assert.match(chefSays(3), /Excellent|Magnifique|Bravo/);
  for (let i = 0; i < 20; i++) assert.doesNotMatch(chefSays(3), /parfait/i); // a level can earn mood 3 without being perfect
  assert.match(chefSays(1), /Essaie encore|Courage/);
});

test("a level total becomes a 1-3 mood", () => {
  assert.strictEqual(moodForTotal(9, 9), 3);
  assert.strictEqual(moodForTotal(6, 9), 2);
  assert.strictEqual(moodForTotal(3, 9), 1);
});
