// Checks the maze in maze.js: it's a real maze, it's fair, and the mice chase.
// Run with:  node --test
const test = require("node:test");
const assert = require("node:assert");
const {
  MAZE, MAZE_LIVES, MOUSE_STARTS, CHEF_START,
  isTrap, isSafe, openDirections, distancesFrom, safeSquares, mouseDirection, canReach, pickFoodSquares,
} = require("../js/maze.js");

test("the chef has 5 hearts", () => {
  assert.strictEqual(MAZE_LIVES, 5);
});

test("every row is the same width and the border is all walls", () => {
  for (const row of MAZE) assert.strictEqual(row.length, MAZE[0].length);
  assert.ok(/^#+$/.test(MAZE[0]) && /^#+$/.test(MAZE[MAZE.length - 1]));
  for (const row of MAZE) assert.ok(row[0] === "#" && row[row.length - 1] === "#");
});

test("the map is bigger than the first version (15 x 11)", () => {
  assert.ok(MAZE[0].length > 15 && MAZE.length > 11);
});

test("there are traps, and every safe square can be reached without stepping on one", () => {
  const traps = MAZE.join("").split("x").length - 1;
  assert.ok(traps >= 3, "the maze should have some traps");
  const reached = Object.keys(distancesFrom(CHEF_START)).length;
  assert.strictEqual(reached, safeSquares().length);
});

test("the chef and the mice start on safe squares", () => {
  for (const s of [CHEF_START, ...MOUSE_STARTS]) assert.ok(isSafe(s.x, s.y));
});

test("mice never step on traps or walls, and don't turn straight back", () => {
  const chefDistances = distancesFrom(CHEF_START);
  let mouse = { ...MOUSE_STARTS[0], dir: null };
  for (let i = 0; i < 300; i++) {
    const dir = mouseDirection(mouse, chefDistances);
    assert.ok(openDirections(mouse.x, mouse.y, true).includes(dir));
    const deadEnd = openDirections(mouse.x, mouse.y, true).length === 1;
    const back = { up: "down", down: "up", left: "right", right: "left" }[mouse.dir];
    if (!deadEnd && mouse.dir) assert.notStrictEqual(dir, back);
    const step = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
    mouse = { x: mouse.x + step[0], y: mouse.y + step[1], dir };
    assert.ok(!isTrap(mouse.x, mouse.y));
  }
});

test("a chasing mouse catches a chef who stands still", () => {
  const alwaysChase = () => 0; // random() = 0 means "chase" every time
  for (const start of MOUSE_STARTS) {
    const chefDistances = distancesFrom(CHEF_START);
    let mouse = { ...start, dir: null };
    let steps = 0;
    while (!(mouse.x === CHEF_START.x && mouse.y === CHEF_START.y) && steps < 100) {
      const dir = mouseDirection(mouse, chefDistances, alwaysChase);
      const step = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
      mouse = { x: mouse.x + step[0], y: mouse.y + step[1], dir };
      steps++;
    }
    assert.ok(steps < 100, "the mouse should reach the chef");
    assert.strictEqual(steps, chefDistances[start.x + "," + start.y], "and by the shortest path");
  }
});

test("canReach respects blocked squares", () => {
  assert.ok(canReach({ x: 1, y: 1 }, { x: 5, y: 1 }, []));
  assert.ok(canReach({ x: 1, y: 1 }, { x: 3, y: 1 }, [{ x: 2, y: 1 }])); // the long way round
});

test("the target food can always be reached without touching a trap or another food", () => {
  const squares = safeSquares();
  for (let i = 0; i < 2000; i++) {
    const chef = squares[i % squares.length];
    const foods = pickFoodSquares(chef, MOUSE_STARTS, 5);
    assert.ok(foods, "found a fair layout");
    assert.strictEqual(new Set(foods.map((s) => s.x + "," + s.y)).size, 5);
    for (const f of foods) assert.ok(isSafe(f.x, f.y), "no food on a trap");
    assert.ok(canReach(chef, foods[0], foods.slice(1)));
  }
});
