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

if (typeof module !== "undefined") {
  module.exports = {
    QUIZ_PASS, QUIZ_PASS_STARS, QUIZ_FAIL_STARS, REVIEW_STARS,
    emptyProgress, earnLevelStars, starsEarned, buyItem, toggleWear, changeStars, recordQuiz,
  };
}
