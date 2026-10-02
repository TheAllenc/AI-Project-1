# La Cuisine 🥖🧀🍓

A browser cooking game that helps French 1–2 students learn **food vocabulary**.
Players read French recipe cards and gather the right ingredients. The levels get harder as you go:

1. **Le Petit-Déjeuner**: click the picture that matches the French word (recognition)
2. **Le Goûter**: also pick the right article: *le / la / les* (gender)
3. **Le Déjeuner**: see the picture and type the French word (recall)
4. **Le Dîner**: build a full menu (*entrée → plat principal → dessert*) against the clock

> **Status:** Milestone 2. Level 1 is fully playable (3 recipes) with a timer, stars, and an end-of-level report. Levels 2–4 come next.

## How to play
No install needed. Download the folder and double-click **`index.html`**. It runs in any modern browser.

## Scoring
Each recipe starts at ★★★. You lose 1 star for any mistake, 1 more for 3 or more mistakes, and 1 if you're slower than the target time (6 seconds per ingredient). You always get at least ★ for finishing.

## How to change the vocabulary
All words live in **`js/vocab.js`**, which is the only file you need to edit.
Open **`vocab-check.html`** to see every word in a table. Rows marked with an orange bar still need a human to check them.

## Project files
| File | What it does |
|---|---|
| `index.html` | The game page: title, level select, kitchen, "recipe finished", and report screens |
| `vocab-check.html` | Table of all vocab, for checking accuracy |
| `style.css` | Colors and layout |
| `js/vocab.js` | The word list (from our French class list) |
| `js/recipes.js` | The levels and their recipes |
| `js/scoring.js` | Star rules (time + mistakes) |
| `js/game.js` | Game logic: levels, shelf, clicks, feedback, timer, report |
| `tests/vocab.test.js` | Automatic checks for mistakes in the word list |
| `tests/recipes.test.js` | Checks every recipe is playable |
| `tests/scoring.test.js` | Checks the star rules |
| `PROCESS_LOG.md` | How AI was used in this project (4D framework log) |

Run the checks with `node --test` (requires Node.js).

## Credits
- Vocabulary: our French class food vocabulary list.
- Built with help from Claude (an AI assistant), which wrote the code to the student's design. All French was checked by the student against the class list. See `PROCESS_LOG.md` for details.
