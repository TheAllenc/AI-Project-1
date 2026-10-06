// ============================================================
// progress.js — the player's saved progress: collected stars,
// finished levels, and the chef's clothes.
//
// Rules:
//   - Finishing a level for the FIRST time adds its stars (up to 15)
//     to your collection. Replaying a finished level adds nothing.
//   - Completing a mini-game for the first time adds 1 star.
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
  };
}

// ---------- Pure rules (no saving here, so the tests can check them) ----------

// Adds a level's stars, only the first time it is finished. Returns the stars added.
function earnLevelStars(p, levelId, stars) {
  if (p.completed[levelId] !== undefined) return 0;
  p.completed[levelId] = stars;
  p.stars += stars;
  return stars;
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
    if (saved && typeof saved.stars === "number") return { ...emptyProgress(), ...saved };
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
  module.exports = { emptyProgress, earnLevelStars, starsEarned, buyItem, toggleWear };
}
