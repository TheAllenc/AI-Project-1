// Checks the answer checker in check.js.
// Run with:  node --test
const test = require("node:test");
const assert = require("node:assert");
const { getWord } = require("../js/vocab.js");
const { checkTyped, genderArticle, splitArticle } = require("../js/check.js");

const w = getWord;

test("exact answers are correct, with or without the article", () => {
  assert.strictEqual(checkTyped("pomme", w("pomme")), "correct");
  assert.strictEqual(checkTyped("la pomme", w("pomme")), "correct");
  assert.strictEqual(checkTyped("pomme de terre", w("pomme-de-terre")), "correct");
});

test("capitals and extra spaces don't matter", () => {
  assert.strictEqual(checkTyped("  La   POMME ", w("pomme")), "correct");
});

test("missing accents are accepted but flagged", () => {
  assert.strictEqual(checkTyped("peche", w("peche")), "accent");
  assert.strictEqual(checkTyped("gateau", w("gateau")), "accent");
  assert.strictEqual(checkTyped("pates", w("pates")), "accent");
  assert.strictEqual(checkTyped("pâtes", w("pates")), "correct");
});

test("wrong accents are flagged too (è instead of ê)", () => {
  assert.strictEqual(checkTyped("pèche", w("peche")), "accent");
});

test("oe counts the same as œ", () => {
  assert.strictEqual(checkTyped("oeuf", w("oeuf")), "correct");
  assert.strictEqual(checkTyped("un oeuf", w("oeuf")), "correct");
  assert.strictEqual(checkTyped("œuf", w("oeuf")), "correct");
});

test("both apostrophes work for l'", () => {
  assert.strictEqual(checkTyped("l'orange", w("orange")), "correct");
  assert.strictEqual(checkTyped("l’orange", w("orange")), "correct");
  assert.strictEqual(checkTyped("l'huile d'olive", w("huile-dolive")), "correct");
  assert.strictEqual(checkTyped("huile d’olive", w("huile-dolive")), "correct");
});

test("a hyphen typed as a space is flagged, not wrong", () => {
  assert.strictEqual(checkTyped("chou fleur", w("chou-fleur")), "accent");
});

test("right word with the wrong article is flagged", () => {
  assert.strictEqual(checkTyped("le pomme", w("pomme")), "article");
  assert.strictEqual(checkTyped("la orange", w("orange")), "article");
  assert.strictEqual(checkTyped("le peche", w("peche")), "article");
});

test("wrong words are wrong", () => {
  assert.strictEqual(checkTyped("poire", w("pomme")), "wrong");
  assert.strictEqual(checkTyped("", w("pomme")), "wrong");
  assert.strictEqual(checkTyped("la", w("pomme")), "wrong");
});

test("splitArticle finds the article", () => {
  assert.deepStrictEqual(splitArticle("la pomme"), { article: "la", noun: "pomme" });
  assert.deepStrictEqual(splitArticle("l'ail"), { article: "l'", noun: "ail" });
  assert.deepStrictEqual(splitArticle("pomme"), { article: null, noun: "pomme" });
});

test("genderArticle uses the hidden gender of l' and un words", () => {
  assert.strictEqual(genderArticle(w("pomme")), "la");
  assert.strictEqual(genderArticle(w("pain")), "le");
  assert.strictEqual(genderArticle(w("orange")), "la");
  assert.strictEqual(genderArticle(w("ananas")), "le");
  assert.strictEqual(genderArticle(w("oeuf")), "le");
  assert.strictEqual(genderArticle(w("bonbons")), "les");
});
