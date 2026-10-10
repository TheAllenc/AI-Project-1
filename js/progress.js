// ============================================================
// progress.js — the player's saved progress: collected stars,
// finished levels, and the chef's clothes.
//
// Rules:
//   - Finishing a level for the FIRST time adds its stars (up to 15)
//     to your collection. Replaying a finished level adds nothing.
//   - Completing a mini-game for the first time adds 1 star.
//   - A surprise review question: right = +1 star, wrong or skipped = -1 star.
//   - A level quiz, FIRST try only: pass = +10 stars, fail = -5 stars.
//   - Stars never go below 0.
//   - Stars buy clothes in the shop. Each item can be bought once.
//   - "Recommencer à zéro" (start over) erases everything, clothes included,
//     so stars can't be farmed by starting over and replaying.
//
// Progress is saved in this browser (localStorage), so it survives closing
// the page. If the browser blocks saving (e.g. a private window), the game
// still works; progress just lasts until the page is closed.
//
// SAVE CODES: to move progress to another computer, encodeSave() turns it
// into a code to copy, and decodeSave() reads it back. There are no
// accounts: no name, email or password, and nothing is sent anywhere.
// ============================================================

// "v2": recipes now give up to 5 stars and the clothes changed, so old
// saved progress (v1) is not loaded.
const PROGRESS_KEY = "la-cuisine-progress-v2";

// A brand-new player.
function emptyProgress() {
  return {
    completed: {},   // level id -> stars earned the first time it was finished
    stars: 0,        // stars available to spend
    owned: [],       // ids of clothes bought
    wearing: {},     // slot -> clothing id (e.g. { hat: "cheese-hat" })
    memory: {},      // word id -> how well the player knows it (memory.js)
    quizzes: {},     // level id -> { firstScore, total, passedFirst, best, attempts }
  };
}

const QUIZ_PASS = 0.8;         // 80% right to pass a quiz
const QUIZ_PASS_STARS = 10;    // first try, passed
const QUIZ_FAIL_STARS = -5;    // first try, failed
const REVIEW_STARS = 1;        // surprise question: +1 right, -1 wrong or skipped

// ---------- Pure rules (no saving here, so the tests can check them) ----------

// Adds a level's stars, only the first time it is finished. Returns the stars added.
function earnLevelStars(p, levelId, stars) {
  if (p.completed[levelId] !== undefined) return 0;
  p.completed[levelId] = stars;
  p.stars += stars;
  return stars;
}

// Adds (or takes away) stars. Stars never go below 0. Returns the real change.
function changeStars(p, amount) {
  const before = p.stars;
  p.stars = Math.max(0, p.stars + amount);
  return p.stars - before;
}

// Records a quiz attempt. Stars only change on the FIRST attempt.
// Returns { passed, first, starChange }.
function recordQuiz(p, levelId, score, total) {
  const passed = total > 0 && score / total >= QUIZ_PASS;
  const previous = p.quizzes[levelId];
  const first = previous === undefined;
  let starChange = 0;
  if (first) {
    starChange = changeStars(p, passed ? QUIZ_PASS_STARS : QUIZ_FAIL_STARS);
    p.quizzes[levelId] = { firstScore: score, total, passedFirst: passed, best: score, attempts: 1 };
  } else {
    previous.attempts++;
    previous.best = Math.max(previous.best, score);
    previous.total = total;
  }
  return { passed, first, starChange };
}

// Total stars ever earned (spent ones included).
function starsEarned(p) {
  return Object.values(p.completed).reduce((sum, n) => sum + n, 0);
}

// Buys an item. Returns "ok", "owned" or "too-expensive".
function buyItem(p, item) {
  if (p.owned.includes(item.id)) return "owned";
  if (p.stars < item.price) return "too-expensive";
  p.stars -= item.price;
  p.owned.push(item.id);
  p.wearing[item.slot] = item.id; // put it on right away
  return "ok";
}

// Puts an owned item on, or takes it off if it is already on.
function toggleWear(p, item) {
  if (!p.owned.includes(item.id)) return;
  if (p.wearing[item.slot] === item.id) delete p.wearing[item.slot];
  else p.wearing[item.slot] = item.id;
}

// ---------- Save codes (pure, so the tests can check them) ----------
// A code looks like:  CUISINE1-<the progress as base64 text>-<checksum>
// The checksum is a number made from the text. If a letter is lost or
// changed when copying, the checksum won't match and we refuse the code
// instead of loading broken progress. (It catches accidents, not cheating.)

const SAVE_PREFIX = "CUISINE1";

function checksum(text) {
  let hash = 5381; // the "djb2" hash: a classic, very short checksum
  for (let i = 0; i < text.length; i++) hash = (hash * 33 + text.charCodeAt(i)) % 1000000007;
  return hash.toString(36);
}

function encodeSave(p) {
  const text = btoa(unescape(encodeURIComponent(JSON.stringify(p)))); // base64, safe for accents
  return SAVE_PREFIX + "-" + text + "-" + checksum(text);
}

// Returns { ok: true, progress } or { ok: false, reason } (reason in French + English).
function decodeSave(code) {
  const parts = String(code).replace(/\s+/g, "").split("-"); // ignore spaces and line breaks
  if (parts.length !== 3 || parts[0] !== SAVE_PREFIX) {
    return { ok: false, reason: "Ce n'est pas un code de La Cuisine. (That's not a La Cuisine save code.)" };
  }
  const [, text, check] = parts;
  if (checksum(text) !== check) {
    return { ok: false, reason: "Le code est incomplet ou a une faute. Recopie-le en entier. (The code is incomplete or has a typo.)" };
  }
  try {
    const saved = JSON.parse(decodeURIComponent(escape(atob(text))));
    const valid = saved && Number.isInteger(saved.stars) && saved.stars >= 0 &&
      typeof saved.completed === "object" && Array.isArray(saved.owned) && typeof saved.wearing === "object";
    if (!valid) throw new Error("bad shape");
    return { ok: true, progress: { ...emptyProgress(), ...saved } };
  } catch (error) {
    return { ok: false, reason: "Ce code ne marche pas. (This code doesn't work.)" };
  }
}

// A short summary to show before loading a code: "⭐ 23 · 3 niveaux · 4 vêtements".
function saveSummary(p) {
  const levels = Object.keys(p.completed).length;
  const clothes = p.owned.length;
  // In French, 0 and 1 take the singular: "0 niveau fini", "2 niveaux finis".
  return "⭐ " + p.stars + " · " + levels + (levels > 1 ? " niveaux finis" : " niveau fini") +
    " · " + clothes + (clothes > 1 ? " vêtements" : " vêtement");
}

// ---------- Saving and loading ----------

let progress = loadProgress();

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    if (saved && typeof saved.stars === "number") return { ...emptyProgress(), ...saved }; // older saves get the new parts empty
  } catch (error) {
    // Nothing saved yet, or saving is blocked: start fresh.
  }
  return emptyProgress();
}

function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    // Saving is blocked in this browser: progress lasts until the page closes.
  }
}

function startOver() {
  progress = emptyProgress();
  saveProgress();
}

// Replaces this browser's progress with a loaded save code.
function replaceProgress(loaded) {
  progress = loaded;
  saveProgress();
}

if (typeof module !== "undefined") {
  module.exports = {
    QUIZ_PASS, QUIZ_PASS_STARS, QUIZ_FAIL_STARS, REVIEW_STARS,
    emptyProgress, earnLevelStars, starsEarned, buyItem, toggleWear, changeStars, recordQuiz,
    SAVE_PREFIX, checksum, encodeSave, decodeSave, saveSummary,
  };
}
