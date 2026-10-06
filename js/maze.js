// ============================================================
// maze.js — "Le Labyrinthe du Chef", a Pac-Man-style game.
//
// You ARE the chef (wearing the clothes you bought). The top of the screen
// says which food to pick up, e.g. "Ramasse : le fromage". Steer the chef
// with the arrow keys / WASD or the on-screen arrows:
//   right food    → +1 point, new foods appear
//   wrong food    → lose a heart (and you see what it was)
//   a mouse 🐭    → lose a heart and go back to the start
// Collect MAZE_GOAL foods to win. 3 hearts.
// Uses helpers from game.js: showScreen, shuffle, pictureFoods,
// showModeResult, withArticle; playSound (sound.js); drawChef (chef.js).
// ============================================================

// # = wall, . = path. Every path square connects (the tests check this).
const MAZE = [
  "###############",
  "#.....#.......#",
  "#.###.#.#####.#",
  "#.#.........#.#",
  "#.#.##.#.##.#.#",
  "#......#......#",
  "#.##.#####.##.#",
  "#.............#",
  "#.###.#.#.###.#",
  "#.....#.#.....#",
  "###############",
];

const MAZE_GOAL = 8;          // foods to collect to win
const MAZE_LIVES = 3;
const FOODS_ON_BOARD = 5;     // the target + 4 others
const CHEF_STEP_MS = 170;     // the chef moves one square this often
const MOUSE_STEP_MS = 340;    // mice are half as fast
const CHEF_START = { x: 1, y: 1 };
const MOUSE_STARTS = [{ x: 13, y: 9 }, { x: 13, y: 1 }];

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

// ---------- Pure helpers (also used by the tests) ----------

function isOpen(x, y) {
  return y >= 0 && y < MAZE.length && x >= 0 && x < MAZE[y].length && MAZE[y][x] === ".";
}

// Directions you can move in from a square.
function openDirections(x, y) {
  return Object.keys(DIRECTIONS).filter((d) => isOpen(x + DIRECTIONS[d].x, y + DIRECTIONS[d].y));
}

// Can you walk from "from" to "to" without stepping on any square in "blocked"?
function canReach(from, to, blocked) {
  const key = (x, y) => x + "," + y;
  const stop = new Set(blocked.map((b) => key(b.x, b.y)));
  const seen = new Set([key(from.x, from.y)]);
  const queue = [from];
  while (queue.length > 0) {
    const { x, y } = queue.shift();
    if (x === to.x && y === to.y) return true;
    for (const d of openDirections(x, y)) {
      const next = { x: x + DIRECTIONS[d].x, y: y + DIRECTIONS[d].y };
      if (!seen.has(key(next.x, next.y)) && !stop.has(key(next.x, next.y))) {
        seen.add(key(next.x, next.y));
        queue.push(next);
      }
    }
  }
  return false;
}

// Picks squares for the foods. The first one (the target) must be reachable
// without walking over any of the other foods, so the game is always fair.
function pickFoodSquares(chef, avoid, count, random = Math.random) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const free = shuffleWith(allOpenSquares(), random).filter((sq) =>
      Math.abs(sq.x - chef.x) + Math.abs(sq.y - chef.y) >= 4 &&
      !avoid.some((a) => a.x === sq.x && a.y === sq.y)
    );
    const squares = free.slice(0, count);
    if (canReach(chef, squares[0], squares.slice(1))) return squares;
  }
  return null; // should never happen; the tests check thousands of layouts
}

// Fisher–Yates shuffle with a chosen random function (so tests can repeat it).
function shuffleWith(list, random) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function allOpenSquares() {
  const squares = [];
  MAZE.forEach((row, y) => [...row].forEach((cell, x) => { if (cell === ".") squares.push({ x, y }); }));
  return squares;
}

// How a mouse chooses where to go: never straight back (unless stuck);
// half the time it heads toward the chef, otherwise it wanders.
function mouseDirection(mouse, chef, random = Math.random) {
  let options = openDirections(mouse.x, mouse.y).filter((d) => d !== OPPOSITE[mouse.dir]);
  if (options.length === 0) options = openDirections(mouse.x, mouse.y);
  if (random() < 0.5) {
    const distance = (d) =>
      Math.abs(mouse.x + DIRECTIONS[d].x - chef.x) + Math.abs(mouse.y + DIRECTIONS[d].y - chef.y);
    return options.reduce((best, d) => (distance(d) < distance(best) ? d : best));
  }
  return options[Math.floor(random() * options.length)];
}

// ---------- The game ----------

const maze = {
  running: false,
  chef: { x: 1, y: 1, dir: null, next: null },
  mice: [],
  foods: [],          // { word, x, y, el }
  target: null,
  score: 0,
  lives: MAZE_LIVES,
  missed: [],
  safeUntil: 0,       // after losing a heart, mice can't hurt you for a moment
  chefTimer: null,
  mouseTimer: null,
  tile: 32,           // size of one square in pixels (set to fit the screen)
};

function startMaze() {
  stopMaze();
  maze.running = true;
  maze.score = 0;
  maze.lives = MAZE_LIVES;
  maze.missed = [];
  maze.target = null;
  showScreen("maze-screen");
  buildBoard();
  resetPositions();
  newFoods();
  mazeFeedback("Utilise les flèches pour bouger ! (Use the arrow keys or buttons.)", "");
  maze.chefTimer = setInterval(chefStep, CHEF_STEP_MS);
  maze.mouseTimer = setInterval(miceStep, MOUSE_STEP_MS);
}

function stopMaze() {
  maze.running = false;
  clearInterval(maze.chefTimer);
  clearInterval(maze.mouseTimer);
}

// Draws the walls and creates the chef and mice.
function buildBoard() {
  const board = document.getElementById("maze-board");
  const width = Math.min(board.parentElement.clientWidth, 600);
  maze.tile = Math.floor(width / MAZE[0].length);
  board.style.setProperty("--tile", maze.tile + "px");
  board.style.width = maze.tile * MAZE[0].length + "px";
  board.style.height = maze.tile * MAZE.length + "px";
  board.innerHTML = "";

  MAZE.forEach((row, y) => [...row].forEach((cell, x) => {
    if (cell !== "#") return;
    const wall = document.createElement("div");
    wall.className = "maze-wall";
    place(wall, x, y);
    board.appendChild(wall);
  }));

  const chef = document.createElement("div");
  chef.id = "maze-chef";
  chef.className = "maze-sprite maze-chef";
  chef.innerHTML = '<div class="maze-chef-inner">' + drawChef(progress.wearing) + "</div>";
  board.appendChild(chef);

  maze.mice = MOUSE_STARTS.map((start) => {
    const el = document.createElement("div");
    el.className = "maze-sprite maze-mouse";
    el.textContent = "🐭";
    board.appendChild(el);
    return { ...start, dir: null, el };
  });
}

// Moves an element to square (x, y).
function place(el, x, y) {
  el.style.transform = "translate(" + x * maze.tile + "px, " + y * maze.tile + "px)";
}

// Puts the chef and mice back at their starting squares (without sliding there).
function resetPositions() {
  maze.chef = { ...CHEF_START, dir: null, next: null };
  const chefEl = document.getElementById("maze-chef");
  for (const mouse of maze.mice) Object.assign(mouse, MOUSE_STARTS[maze.mice.indexOf(mouse)], { dir: null });
  const sprites = [chefEl, ...maze.mice.map((m) => m.el)];
  sprites.forEach((el) => el.classList.add("no-slide"));
  place(chefEl, maze.chef.x, maze.chef.y);
  maze.mice.forEach((m) => place(m.el, m.x, m.y));
  void chefEl.offsetWidth; // apply the jump before turning sliding back on
  sprites.forEach((el) => el.classList.remove("no-slide"));
}

// A new set of foods: the target plus others, on free squares away from the chef.
function newFoods() {
  for (const food of maze.foods) food.el.remove();
  const choices = shuffle(pictureFoods().filter((w) => !maze.target || w.id !== maze.target.id));
  const words = choices.slice(0, FOODS_ON_BOARD);
  maze.target = words[0];

  const free = pickFoodSquares(maze.chef, maze.mice, words.length);

  const board = document.getElementById("maze-board");
  maze.foods = words.map((word, i) => {
    const el = document.createElement("div");
    el.className = "maze-sprite maze-food";
    el.textContent = word.emoji;
    place(el, free[i].x, free[i].y);
    board.appendChild(el);
    return { word, x: free[i].x, y: free[i].y, el };
  });

  document.getElementById("maze-target").textContent = withArticle(maze.target);
  drawMazeStatus();
}

// ---------- Each step ----------

function chefStep() {
  if (!maze.running) return;
  const chef = maze.chef;
  // Turn if the chosen direction is open (Pac-Man style: you can press early).
  if (chef.next && openDirections(chef.x, chef.y).includes(chef.next)) chef.dir = chef.next;
  if (!chef.dir || !openDirections(chef.x, chef.y).includes(chef.dir)) return; // stopped at a wall

  chef.x += DIRECTIONS[chef.dir].x;
  chef.y += DIRECTIONS[chef.dir].y;
  const chefEl = document.getElementById("maze-chef");
  place(chefEl, chef.x, chef.y);
  chefEl.classList.toggle("facing-left", chef.dir === "left");

  const food = maze.foods.find((f) => f.x === chef.x && f.y === chef.y);
  if (food) eatFood(food);
  if (maze.running) checkMice();
}

function miceStep() {
  if (!maze.running) return;
  for (const mouse of maze.mice) {
    mouse.dir = mouseDirection(mouse, maze.chef);
    mouse.x += DIRECTIONS[mouse.dir].x;
    mouse.y += DIRECTIONS[mouse.dir].y;
    place(mouse.el, mouse.x, mouse.y);
  }
  checkMice();
}

function eatFood(food) {
  food.el.remove();
  maze.foods = maze.foods.filter((f) => f !== food);

  if (food.word.id === maze.target.id) {
    maze.score++;
    playSound("good");
    mazeFeedback("Miam ! " + withArticle(food.word) + " ✓", "good");
    if (maze.score >= MAZE_GOAL) {
      endMaze(true);
      return;
    }
    newFoods();
  } else {
    if (!maze.missed.includes(maze.target.id)) maze.missed.push(maze.target.id);
    loseHeart("Non ! Ça, c'est " + withArticle(food.word) + " (" + food.word.en + ").");
  }
}

function checkMice() {
  if (Date.now() < maze.safeUntil) return;
  const caught = maze.mice.some((m) => m.x === maze.chef.x && m.y === maze.chef.y);
  if (!caught) return;
  loseHeart("Aïe ! Une souris ! (A mouse got you!)");
  if (!maze.running) return;
  resetPositions();
  maze.safeUntil = Date.now() + 1500;
  const chefEl = document.getElementById("maze-chef");
  chefEl.classList.add("blink");
  setTimeout(() => chefEl.classList.remove("blink"), 1500);
}

function loseHeart(message) {
  maze.lives--;
  playSound("bad");
  mazeFeedback(message, "bad");
  drawMazeStatus();
  if (maze.lives <= 0) endMaze(false);
}

function endMaze(won) {
  stopMaze();
  showModeResult({
    id: "maze",
    title: won ? "Le Labyrinthe : gagné ! 🏆" : "Le Labyrinthe : fini !",
    score: maze.score,
    scoreText: maze.score + " / " + MAZE_GOAL + (maze.score === 1 ? " aliment ramassé" : " aliments ramassés") + " (foods collected)",
    lines: [won ? "Tu as tout ramassé ! (You collected them all!)" : "Plus de cœurs. Essaie encore ! (Out of hearts. Try again!)"],
    missed: maze.missed,
    replay: startMaze,
  });
}

// ---------- Drawing and controls ----------

function drawMazeStatus() {
  document.getElementById("maze-status").textContent =
    "Score : " + maze.score + " / " + MAZE_GOAL + " · " +
    "❤️".repeat(Math.max(0, maze.lives)) + "🖤".repeat(MAZE_LIVES - Math.max(0, maze.lives));
}

function mazeFeedback(message, type) {
  const box = document.getElementById("maze-feedback");
  box.textContent = message;
  box.className = "feedback " + type;
}

if (typeof document !== "undefined") {
  const KEYS = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
  };
  document.addEventListener("keydown", (event) => {
    const dir = KEYS[event.key] || KEYS[event.key.toLowerCase()];
    if (!maze.running || !dir) return;
    event.preventDefault(); // stop the arrow keys from scrolling the page
    maze.chef.next = dir;
  });
  for (const button of document.querySelectorAll(".dpad-button")) {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      maze.chef.next = button.dataset.dir;
    });
  }
  document.getElementById("maze-quit-button").addEventListener("click", () => {
    stopMaze();
    showLevels();
  });
}

if (typeof module !== "undefined") {
  module.exports = { MAZE, MOUSE_STARTS, CHEF_START, isOpen, openDirections, allOpenSquares, mouseDirection, canReach, pickFoodSquares };
}
