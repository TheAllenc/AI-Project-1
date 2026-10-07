// Checks the spaced-repetition memory in memory.js.
// Run with:  node --test
const test = require("node:test");
const assert = require("node:assert");
const {
  BOX_WAIT_MINUTES, wordRecord, recordAnswer, isDue, wordWeight, masteryOf, pickWeighted, chooseReviewWord,
} = require("../js/memory.js");

const MIN = 60 * 1000;

test("a new word starts in box 0", () => {
  assert.strictEqual(wordRecord({}, "pomme").box, 0);
  assert.strictEqual(masteryOf(wordRecord({}, "pomme")), "nouveau");
});

test("right answers move a word up, a wrong answer sends it back to box 1", () => {
  const mem = {};
  recordAnswer(mem, "pomme", true, 0);
  assert.strictEqual(mem.pomme.box, 2);
  recordAnswer(mem, "pomme", true, 0);
  recordAnswer(mem, "pomme", true, 0);
  recordAnswer(mem, "pomme", true, 0);
  assert.strictEqual(mem.pomme.box, 5);
  recordAnswer(mem, "pomme", true, 0);
  assert.strictEqual(mem.pomme.box, 5, "never above 5");
  recordAnswer(mem, "pomme", false, 0);
  assert.strictEqual(mem.pomme.box, 1);
  assert.deepStrictEqual([mem.pomme.right, mem.pomme.wrong, mem.pomme.seen], [5, 1, 6]);
});

test("waiting times grow from box to box", () => {
  for (let box = 2; box < BOX_WAIT_MINUTES.length; box++) {
    assert.ok(BOX_WAIT_MINUTES[box] > BOX_WAIT_MINUTES[box - 1]);
  }
});

test("a word becomes due once its waiting time has passed", () => {
  const mem = {};
  recordAnswer(mem, "pomme", true, 0); // box 2: wait 10 minutes
  assert.ok(!isDue(mem.pomme, 9 * MIN));
  assert.ok(isDue(mem.pomme, 10 * MIN));
});

test("struggling words weigh more than mastered words, and due words count double", () => {
  const mem = {};
  recordAnswer(mem, "hard", false, 0);
  for (let i = 0; i < 4; i++) recordAnswer(mem, "easy", true, 0);
  assert.ok(wordWeight(mem, "hard", 0) > wordWeight(mem, "easy", 0));
  assert.ok(wordWeight(mem, "new-word", 0) > wordWeight(mem, "easy", 0), "new words come before mastered ones");
  const notDue = wordWeight(mem, "hard", 0);
  assert.strictEqual(wordWeight(mem, "hard", 5 * MIN), notDue * 2);
});

test("labels: à revoir, en progrès, maîtrisé", () => {
  const mem = {};
  recordAnswer(mem, "a", false, 0);
  recordAnswer(mem, "b", true, 0);
  for (let i = 0; i < 3; i++) recordAnswer(mem, "c", true, 0);
  assert.strictEqual(masteryOf(mem.a, 0), "à revoir");
  assert.strictEqual(masteryOf(mem.b, 0), "en progrès");
  assert.strictEqual(masteryOf(mem.c, 0), "maîtrisé");
});

test("pickWeighted picks different items and favors heavy ones", () => {
  let heavyFirst = 0;
  for (let i = 0; i < 2000; i++) {
    const picked = pickWeighted(["light", "heavy", "middle"], (x) => ({ light: 1, middle: 2, heavy: 10 }[x]), 2);
    assert.strictEqual(new Set(picked).size, 2);
    if (picked[0] === "heavy") heavyFirst++;
  }
  assert.ok(heavyFirst > 1400, "heavy should come first about 77% of the time, got " + heavyFirst);
});

test("a struggling word is picked far more often than a mastered one", () => {
  const mem = {};
  recordAnswer(mem, "hard", false, 0);
  for (let i = 0; i < 5; i++) recordAnswer(mem, "easy", true, 0);
  let hard = 0;
  for (let i = 0; i < 1000; i++) {
    if (pickWeighted(["hard", "easy"], (id) => wordWeight(mem, id, 0), 1)[0] === "hard") hard++;
  }
  assert.ok(hard > 850, "got " + hard);
});

test("review questions only use words already seen, and prefer due words", () => {
  const mem = {};
  assert.strictEqual(chooseReviewWord(mem, ["a", "b", "c", "d"], 0), null, "nothing seen yet");
  for (const id of ["a", "b", "c", "d"]) recordAnswer(mem, id, true, 0);
  recordAnswer(mem, "d", false, 0); // d is struggling: due after 2 minutes
  for (let i = 0; i < 50; i++) {
    assert.strictEqual(chooseReviewWord(mem, ["a", "b", "c", "d", "never-seen"], 3 * MIN), "d");
  }
});
