// ============================================================
// memory.js — remembers how well the player knows each word,
// so the game can bring words back at the right time.
//
// The method: SPACED REPETITION with LEITNER BOXES.
//   Every word sits in a "box" from 0 to 5:
//     box 0      = never seen (new)
//     box 1      = struggling: you got it wrong last time
//     box 2–3    = learning
//     box 4–5    = mastered
//   A right answer moves the word UP one box. A wrong answer sends it back to box 1.
//   Each box has a waiting time. When that time has passed, the word is "due"
//   for review (we're about to forget it), so the game shows it more often.
//
// The game uses wordWeight() to decide which words to show:
// struggling and due words get a big weight (shown often),
// mastered words a small weight (shown rarely, but never zero).
// ============================================================

// How long to wait before a word in each box is due again (in minutes).
// Short at first, then longer and longer: the "spacing" in spaced repetition.
const BOX_WAIT_MINUTES = [0, 2, 10, 60, 24 * 60, 3 * 24 * 60];

// How likely a word in each box is to be picked (bigger = more often).
const BOX_WEIGHT = [3, 6, 4, 2, 1, 0.5];

// A word's record, or a fresh one if the player has never seen it.
function wordRecord(memory, id) {
  return memory[id] || { box: 0, seen: 0, right: 0, wrong: 0, last: 0 };
}

// Saves one answer. now = time in milliseconds (Date.now()).
function recordAnswer(memory, id, correct, now = Date.now()) {
  const record = { ...wordRecord(memory, id) };
  record.seen++;
  if (correct) {
    record.right++;
    record.box = Math.min(5, Math.max(1, record.box) + 1); // up one box (a new word goes straight to box 2)
  } else {
    record.wrong++;
    record.box = 1; // back to the start
  }
  record.last = now;
  memory[id] = record;
  return record;
}

// Has the word's waiting time passed?
function isDue(record, now = Date.now()) {
  if (record.box === 0) return false;
  return now - record.last >= BOX_WAIT_MINUTES[record.box] * 60 * 1000;
}

// How likely the word is to be picked right now. Due words count double.
function wordWeight(memory, id, now = Date.now()) {
  const record = wordRecord(memory, id);
  const weight = BOX_WEIGHT[record.box];
  return isDue(record, now) ? weight * 2 : weight;
}

// A short label for the player: new, to review, learning, or mastered.
function masteryOf(record, now = Date.now()) {
  if (record.box === 0) return "nouveau";
  if (record.box === 1 || isDue(record, now)) return "à revoir";
  if (record.box >= 4) return "maîtrisé";
  return "en progrès";
}

// Fisher–Yates shuffle with a chosen random function (so tests can repeat it).
function shuffleWith(list, random = Math.random) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Picks "count" different items. Items with a bigger weight are more likely.
// (Weighted random sampling without putting items back.)
function pickWeighted(items, weightOf, count, random = Math.random) {
  const pool = [...items];
  const chosen = [];
  while (chosen.length < count && pool.length > 0) {
    const weights = pool.map((item) => Math.max(0.0001, weightOf(item)));
    let ticket = random() * weights.reduce((a, b) => a + b, 0);
    let index = 0;
    while (index < pool.length - 1 && ticket >= weights[index]) {
      ticket -= weights[index];
      index++;
    }
    chosen.push(pool.splice(index, 1)[0]);
  }
  return chosen;
}

// The word to review in a surprise question: only words the player has
// already seen; due words first, and among them the weakest are most likely.
// Returns null if the player hasn't seen enough words yet.
const MIN_SEEN_FOR_REVIEW = 4;
function chooseReviewWord(memory, ids, now = Date.now(), random = Math.random) {
  const seen = ids.filter((id) => wordRecord(memory, id).box > 0);
  if (seen.length < MIN_SEEN_FOR_REVIEW) return null;
  const due = seen.filter((id) => isDue(wordRecord(memory, id), now));
  const pool = due.length > 0 ? due : seen;
  return pickWeighted(pool, (id) => wordWeight(memory, id, now), 1, random)[0];
}

if (typeof module !== "undefined") {
  module.exports = {
    BOX_WAIT_MINUTES, BOX_WEIGHT, MIN_SEEN_FOR_REVIEW,
    wordRecord, recordAnswer, isDue, wordWeight, masteryOf, shuffleWith, pickWeighted, chooseReviewWord,
  };
}
