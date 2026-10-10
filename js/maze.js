// ============================================================
// maze.js — "Le Labyrinthe du Chef", a Pac-Man-style game.
//
// You ARE the chef (wearing the clothes you bought). The top of the screen
// says which food to pick up, e.g. "Ramasse : le fromage". Steer the chef
// with the arrow keys / WASD or the on-screen arrows:
//   right food    → +1 point, new foods appear
//   wrong food    → lose a heart (and you see what it was)
//   a trap 🔥     → lose a heart (hot stoves on the floor)
//   a mouse 🐭    → lose a heart and go back to the start
// The mice CHASE the chef: they follow the shortest path to him (with a
// little randomness, so you can escape). Collect MAZE_GOAL foods to win. 5 hearts.
// Uses helpers from game.js: showScreen, shuffle, pictureFoods,
// showModeResult, withArticle; playSound (sound.js); drawChef (chef.js).
// ============================================================

// # = wall, . = path, x = trap (a hot stove 🔥: stepping on it costs a heart).
// Every path square connects without crossing a trap (the tests check this).
const MAZE = [
  "###################",
  "#........#...x....#",
  "#.##.###.#.###.##.#",
  "#....x............#",
  "#.##.#.#####.#.##.#",
  "#....#...#...#....#",
  "####.###.#.###.####",
  "#....#.......#....#",
  "#.##.#.##x##.#.##.#",
  "#..#.......x...#..#",
  "##.#.#.#####.#.#.##",
  "#....#...#...#....#",
  "#.######.#.######.#",
  "#........x........#",
  "###################",
];

const MAZE_GOAL = 8;          // foods to collect to win
const MAZE_LIVES = 5;
const FOODS_ON_BOARD = 5;     // the target + 4 others
const CHEF_STEP_MS = 170;     // the chef moves one square this often
const MOUSE_STEP_MS = 300;    // mice are a bit slower than the chef
const MOUSE_CHASE = 0.75;     // how often a mouse takes the step toward the chef
const SAFE_MS = 1500;         // after losing a heart, nothing can hurt you for this long
const CHEF_START = { x: 1, y: 1 };
const MOUSE_STARTS = [{ x: 17, y: 13 }, { x: 17, y: 1 }, { x: 1, y: 13 }];

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

// ---------- Pure helpers (also used by the tests) ----------

function cellAt(x, y) {
  return y >= 0 && y < MAZE.length && x >= 0 && x < MAZE[y].length ? MAZE[y][x] : "#";
}

// The chef can walk anywhere that isn't a wall (even onto a trap — ouch).
function isOpen(x, y) {
  return cellAt(x, y) !== "#";
}

function isTrap(x, y) {
  return cellAt(x, y) === "x";
}

// "Safe" = a path square with no trap. Mice and food only use safe squares.
function isSafe(x, y) {
  return cellAt(x, y) === ".";
}

// Directions you can move in from a square (safeOnly: avoid traps too).
function openDirections(x, y, safeOnly = false) {
  const ok = safeOnly ? isSafe : isOpen;
  return Object.keys(DIRECTIONS).filter((d) => ok(x + DIRECTIONS[d].x, y + DIRECTIONS[d].y));
}

// How many steps every safe square is from a starting square (breadth-first search).
function distancesFrom(start) {
  const key = (x, y) => x + "," + y;
  const dist = { [key(start.x, start.y)]: 0 };
  const queue = [start];
  while (queue.length > 0) {
    const { x, y } = queue.shift();
    for (const d of openDirections(x, y, true)) {
      const nx = x + DIRECTIONS[d].x;
      const ny = y + DIRECTIONS[d].y;
      if (dist[key(nx, ny)] === undefined) {
        dist[key(nx, ny)] = dist[key(x, y)] + 1;
        queue.push({ x: nx, y: ny });
      }
    }
  }
  return dist;
}

// Can you walk from "from" to "to" without stepping on a trap or any square in "blocked"?
function canReach(from, to, blocked) {
  const key = (x, y) => x + "," + y;
  const stop = new Set(blocked.map((b) => key(b.x, b.y)));
  const seen = new Set([key(from.x, from.y)]);
  const queue = [from];
  while (queue.length > 0) {
    const { x, y } = queue.shift();
    if (x === to.x && y === to.y) return true;
    for (const d of openDirections(x, y, true)) {
      const next = { x: x + DIRECTIONS[d].x, y: y + DIRECTIONS[d].y };
      if (!seen.has(key(next.x, next.y)) && !stop.has(key(next.x, next.y))) {
        seen.add(key(next.x, next.y));
        queue.push(next);
      }
    }
  }
  return false;
}

// Picks squares for the foods (never on a trap). The first one (the target)
// must be reachable without walking over a trap or another food, so the game is always fair.
function pickFoodSquares(chef, avoid, count, random = Math.random) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const free = shuffleWith(safeSquares(), random).filter((sq) =>
      Math.abs(sq.x - chef.x) + Math.abs(sq.y - chef.y) >= 4 &&
      !avoid.some((a) => a.x === sq.x && a.y === sq.y)
    );
    const squares = free.slice(0, count);
    if (canReach(chef, squares[0], squares.slice(1))) return squares;
  }
  return null; // should never happen; the tests check thousands of layouts
}

function safeSquares() {
  const squares = [];
  MAZE.forEach((row, y) => [...row].forEach((cell, x) => { if (cell === ".") squares.push({ x, y }); }));
  return squares;
}

// How a mouse chooses where to go. It never steps on a trap and never turns
// straight back (unless it's stuck). Most of the time (MOUSE_CHASE) it takes
// the step that is closest to the chef along the maze's paths; otherwise it wanders.
// chefDistances = distancesFrom(chef), worked out once per step for all mice.
function mouseDirection(mouse, chefDistances, random = Math.random) {
  let options = openDirections(mouse.x, mouse.y, true).filter((d) => d !== OPPOSITE[mouse.dir]);
  if (options.length === 0) options = openDirections(mouse.x, mouse.y, true);
  if (random() < MOUSE_CHASE) {
    const steps = (d) => {
      const n = chefDistances[(mouse.x + DIRECTIONS[d].x) + "," + (mouse.y + DIRECTIONS[d].y)];
      return n === undefined ? Infinity : n;
    };
    return options.reduce((best, d) => (steps(d) < steps(best) ? d : best));
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
  safeUntil: 0,       // after losing a heart, mice and traps can't hurt you for a moment
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
  const width = Math.min(board.parentElement.clientWidth, 720);
  maze.tile = Math.floor(width / MAZE[0].length);
  board.style.setProperty("--tile", maze.tile + "px");
  board.style.width = maze.tile * MAZE[0].length + "px";
  board.style.height = maze.tile * MAZE.length + "px";
  board.innerHTML = "";

  MAZE.forEach((row, y) => [...row].forEach((cell, x) => {
    if (cell === ".") return;
    const square = document.createElement("div");
    square.className = cell === "#" ? "maze-wall" : "maze-trap";
    if (cell === "x") square.textContent = "🔥";
    place(square, x, y);
    board.appendChild(square);
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
  // The food to find is picked by spaced repetition (weak words more often);
  // the other foods on the board are random.
  const choices = pictureFoods().filter((w) => !maze.target || w.id !== maze.target.id);
  maze.target = pickWeighted(choices, (w) => wordWeight(progress.memory, w.id), 1)[0];
  const words = [maze.target, ...shuffle(choices.filter((w) => w !== maze.target)).slice(0, FOODS_ON_BOARD - 1)];

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
  speakFrench(withArticle(maze.target), { queue: true });
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
  if (maze.running && isTrap(chef.x, chef.y)) stepOnTrap();
  if (maze.running) checkMice();
}

function miceStep() {
  if (!maze.running) return;
  const chefDistances = distancesFrom(maze.chef);
  for (const mouse of maze.mice) {
    mouse.dir = mouseDirection(mouse, chefDistances);
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
    remember(food.word.id, true);
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
    remember(maze.target.id, false);
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
  makeSafe();
}

function stepOnTrap() {
  if (Date.now() < maze.safeUntil) return;
  loseHeart("Ouille ! C'est chaud ! (A hot stove! Watch out for 🔥)");
  if (maze.running) makeSafe();
}

// A short moment where nothing can hurt the chef (he blinks).
function makeSafe() {
  maze.safeUntil = Date.now() + SAFE_MS;
  const chefEl = document.getElementById("maze-chef");
  chefEl.classList.add("blink");
  setTimeout(() => chefEl.classList.remove("blink"), SAFE_MS);
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
    completed: won,
    goal: "ramasse les " + MAZE_GOAL + " aliments (collect all " + MAZE_GOAL + " foods)",
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
  globalThis.shuffleWith = globalThis.shuffleWith || require("./memory.js").shuffleWith; // for the tests
  module.exports = {
    MAZE, MAZE_LIVES, MOUSE_STARTS, CHEF_START,
    isOpen, isTrap, isSafe, openDirections, distancesFrom, safeSquares, mouseDirection, canReach, pickFoodSquares,
  };
}
