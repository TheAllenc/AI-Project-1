// Checks voice.js (the parts that don't need a browser).
// Run with:  node --test
const test = require("node:test");
const assert = require("node:assert");
const { frenchPart } = require("../js/voice.js");
const { chefSays } = require("../js/chef.js");

test("the voice reads only the French, never the English in brackets", () => {
  assert.strictEqual(frenchPart("Bravo ! (Well done!)"), "Bravo !");
  assert.strictEqual(frenchPart("Bonjour ! Je suis Chef Barbe. On cuisine ? (Hi! I'm Chef Barbe. Let's cook!)"),
    "Bonjour ! Je suis Chef Barbe. On cuisine ?");
  assert.strictEqual(frenchPart("Merci ! Au revoir !"), "Merci ! Au revoir !");
});

test("every chef message has French for the voice to read", () => {
  for (let stars = 1; stars <= 3; stars++) {
    for (let i = 0; i < 30; i++) {
      const french = frenchPart(chefSays(stars));
      assert.ok(french.length > 3, "empty French part for " + stars + " stars");
      assert.ok(!french.includes("("), french);
    }
  }
});
