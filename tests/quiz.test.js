// Checks the quiz questions in quiz.js.
// Run with:  node --test
const test = require("node:test");
const assert = require("node:assert");
const vocab = require("../js/vocab.js");
const recipes = require("../js/recipes.js");
const memory = require("../js/memory.js");

// quiz.js uses these as shared (global) names, like in the browser.
Object.assign(globalThis, vocab, { levelWords: recipes.levelWords, shuffleWith: memory.shuffleWith });
const { QUIZ_CHOICES, buildQuestion, buildLevelQuiz } = require("../js/quiz.js");
const { VOCAB, withArticle } = vocab;
const { LEVELS, levelWords } = recipes;

test("each level quiz asks about EVERY word of the level, once", () => {
  for (const level of LEVELS) {
    const quiz = buildLevelQuiz(level);
    const asked = quiz.map((q) => q.wordId).sort();
    assert.deepStrictEqual(asked, [...levelWords(level)].sort(), level.name);
  }
});

test("every question has 4 different options and exactly one right answer", () => {
  for (const word of VOCAB) {
    for (const kind of ["fr-en", "en-fr"]) {
      const q = buildQuestion(word, kind);
      assert.strictEqual(q.options.length, QUIZ_CHOICES, word.id);
      assert.strictEqual(new Set(q.options).size, QUIZ_CHOICES, word.id + " has repeated options");
      const right = kind === "fr-en" ? word.en : withArticle(word);
      assert.strictEqual(q.options[q.answerIndex], right);
      assert.strictEqual(q.options.filter((o) => o === right).length, 1);
    }
  }
});

test("wrong options never mean the same thing as the answer (e.g. la soupe / le potage)", () => {
  for (const word of VOCAB) {
    const q = buildQuestion(word, "fr-en");
    const wrong = q.options.filter((_, i) => i !== q.answerIndex);
    for (const text of wrong) {
      const other = VOCAB.find((w) => w.en === text);
      assert.notStrictEqual(other.fr, word.fr, word.id + ": a wrong option is the same French word");
    }
    const q2 = buildQuestion(word, "en-fr");
    const wrongWords = q2.options.filter((_, i) => i !== q2.answerIndex).map((t) => VOCAB.find((w) => withArticle(w) === t));
    for (const other of wrongWords) assert.notStrictEqual(other.en, word.en, word.id + ": a wrong option has the same English");
  }
});

test("a picture question shows the emoji; a word with no picture shows its English or clue", () => {
  const pomme = vocab.getWord("pomme");
  assert.strictEqual(buildQuestion(pomme, "en-fr").prompt, "🍎");
  const pruneau = vocab.getWord("pruneau");
  assert.strictEqual(buildQuestion(pruneau, "en-fr").prompt, "“a dried plum”");
  assert.strictEqual(buildQuestion(pruneau, "fr-en").prompt, "le pruneau");
});
