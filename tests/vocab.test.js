// Checks that vocab.js has no data mistakes (typos in fields, duplicate ids, etc).
// Run with:  node --test
const test = require("node:test");
const assert = require("node:assert");
const { VOCAB, CATEGORY_NAMES, withArticle, getWord } = require("../js/vocab.js");

test("every id is unique", () => {
  const ids = VOCAB.map((w) => w.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

test("every word has the required fields", () => {
  for (const w of VOCAB) {
    assert.ok(w.id && w.fr && w.en, `missing id/fr/en on ${JSON.stringify(w)}`);
    assert.ok([null, "le", "la", "l'", "les", "un"].includes(w.article), `bad article on ${w.id}`);
    assert.ok([null, "m", "f"].includes(w.gender), `bad gender on ${w.id}`);
    assert.strictEqual(typeof w.plural, "boolean", `plural must be true/false on ${w.id}`);
    assert.ok(w.categories.length > 0, `no category on ${w.id}`);
    for (const c of w.categories) assert.ok(CATEGORY_NAMES[c], `unknown category "${c}" on ${w.id}`);
  }
});

test("articles agree with gender and plural", () => {
  for (const w of VOCAB) {
    if (w.article === "le") assert.strictEqual(w.gender, "m", w.id);
    if (w.article === "la") assert.strictEqual(w.gender, "f", w.id);
    if (w.article === "les") assert.strictEqual(w.plural, true, w.id);
    if (w.plural) assert.strictEqual(w.article, "les", w.id);
  }
});

test("nouns have a gender, verbs do not", () => {
  for (const w of VOCAB) {
    if (w.article) assert.ok(w.gender, `${w.id} has an article but no gender`);
    else assert.strictEqual(w.gender, null, `${w.id} has no article but has a gender`);
  }
});

test("no two words share the same emoji (pictures must not be ambiguous)", () => {
  const emojis = VOCAB.filter((w) => w.emoji).map((w) => w.emoji);
  assert.strictEqual(new Set(emojis).size, emojis.length);
});

test("withArticle formats words correctly", () => {
  assert.strictEqual(withArticle(getWord("pomme")), "la pomme");
  assert.strictEqual(withArticle(getWord("orange")), "l’orange");
  assert.strictEqual(withArticle(getWord("pates")), "les pâtes");
  assert.strictEqual(withArticle(getWord("oeuf")), "un œuf");
  assert.strictEqual(withArticle(getWord("manger")), "manger");
});
