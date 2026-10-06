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

test("clothes are cheap: 1-6 stars each, and some cost only 1", () => {
  for (const item of CLOTHES) assert.ok(item.price >= 1 && item.price <= 6, item.id);
  assert.ok(CLOTHES.some((c) => c.price === 1));
});

test("there's at least one of each kind, including beards", () => {
  for (const slot of Object.keys(SLOT_NAMES)) {
    assert.ok(CLOTHES.filter((c) => c.slot === slot).length >= 3, slot);
  }
  assert.ok(SLOT_NAMES.beard);
});

test("drawChef shows the clothes being worn", () => {
  assert.ok(drawChef({}).includes("<svg"));
  assert.ok(drawChef({ hat: "cheese-hat" }).includes(CLOTHES_SVG["cheese-hat"]));
  assert.ok(!drawChef({ hat: "cheese-hat" }).includes(CLOTHES_SVG.toque)); // the cheese hat replaces the chef's hat
  assert.ok(drawChef({}).includes("chef-beard"));
  assert.ok(!drawChef({ beard: "jelly-beard" }).includes("chef-beard")); // the jelly beard replaces his beard
  assert.ok(!drawChef({ hat: "an-old-removed-hat" }).includes("undefined")); // unknown items are ignored
});

test("the chef's message matches the stars", () => {
  assert.match(chefSays(3), /Excellent|Magnifique|Bravo/);
  for (let i = 0; i < 20; i++) assert.doesNotMatch(chefSays(3), /parfait/i); // a level can earn mood 3 without being perfect
  assert.match(chefSays(1), /Essaie encore|Courage/);
});

test("stars become a 1-3 mood for the chef", () => {
  assert.strictEqual(moodForTotal(5, 5), 3); // one recipe: 5 stars = great work
  assert.strictEqual(moodForTotal(4, 5), 2);
  assert.strictEqual(moodForTotal(3, 5), 2);
  assert.strictEqual(moodForTotal(1, 5), 1); // 1 star = try again
  assert.strictEqual(moodForTotal(14, 15), 3); // a whole level
});
