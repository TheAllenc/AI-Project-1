// Checks the maze in maze.js: it's a real maze and every square can be reached.
// Run with:  node --test
const test = require("node:test");
const assert = require("node:assert");
const { MAZE, MOUSE_STARTS, CHEF_START, isOpen, openDirections, allOpenSquares, mouseDirection, canReach, pickFoodSquares } = require("../js/maze.js");

test("every row is the same width and the border is all walls", () => {
  for (const row of MAZE) assert.strictEqual(row.length, MAZE[0].length);
  assert.ok(/^#+$/.test(MAZE[0]) && /^#+$/.test(MAZE[MAZE.length - 1]));
  for (const row of MAZE) assert.ok(row[0] === "#" && row[row.length - 1] === "#");
});

test("every open square can be reached from the chef's start", () => {
  const seen = new Set([CHEF_START.x + "," + CHEF_START.y]);
  const queue = [CHEF_START];
  while (queue.length) {
    const { x, y } = queue.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const key = x + dx + "," + (y + dy);
      if (isOpen(x + dx, y + dy) && !seen.has(key)) {
        seen.add(key);
        queue.push({ x: x + dx, y: y + dy });
      }
    }
  }
  assert.strictEqual(seen.size, allOpenSquares().length);
});

test("the chef and the mice start on open squares", () => {
  for (const s of [CHEF_START, ...MOUSE_STARTS]) assert.ok(isOpen(s.x, s.y));
});

test("mice only move onto open squares and don't turn straight back", () => {
  let mouse = { ...MOUSE_STARTS[0], dir: null };
  for (let i = 0; i < 200; i++) {
    const dir = mouseDirection(mouse, CHEF_START);
    assert.ok(openDirections(mouse.x, mouse.y).includes(dir));
    const deadEnd = openDirections(mouse.x, mouse.y).length === 1;
    const back = { up: "down", down: "up", left: "right", right: "left" }[mouse.dir];
    if (!deadEnd && mouse.dir) assert.notStrictEqual(dir, back);
    const step = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
    mouse = { x: mouse.x + step[0], y: mouse.y + step[1], dir };
  }
});

test("canReach respects blocked squares", () => {
  assert.ok(canReach({ x: 1, y: 1 }, { x: 5, y: 1 }, []));
  // Block the only square between two neighbours in a corridor... and the long way round still works:
  assert.ok(canReach({ x: 1, y: 1 }, { x: 3, y: 1 }, [{ x: 2, y: 1 }]));
});

test("the target food can always be reached without touching another food", () => {
  for (let i = 0; i < 2000; i++) {
    const chef = allOpenSquares()[i % allOpenSquares().length];
    const squares = pickFoodSquares(chef, MOUSE_STARTS, 5);
    assert.ok(squares, "found a fair layout");
    assert.strictEqual(new Set(squares.map((s) => s.x + "," + s.y)).size, 5);
    assert.ok(canReach(chef, squares[0], squares.slice(1)));
  }
});
