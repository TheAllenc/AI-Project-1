# La Cuisine 🥖🧀🍓

A browser cooking game that helps French 1–2 students learn **food vocabulary**.
Players read French recipe cards and gather the right ingredients. The levels get harder as you go:

1. **Le Petit-Déjeuner**: click the picture that matches the French word (recognition)
2. **Le Goûter**: also pick the right article: *le / la / les* (gender)
3. **Le Déjeuner**: see the picture and type the French word (recall)
4. **Le Dîner**: build a full menu (*entrée → plat principal → dessert*) against the clock

> **Status:** Milestone 3. Levels 1–3 are playable (3 recipes each). Level 4 (the full menu) comes next.

## How to play
No install needed. Download the folder and double-click **`index.html`**. It runs in any modern browser.

## Scoring
Each recipe starts at ★★★. You lose 1 star for any mistake, 1 more for 3 or more mistakes, and 1 if you're slower than the target time: 6 seconds per ingredient in Level 1, 8 in Level 2, and 12 in Level 3. You always get at least ★ for finishing.

## Typing rules (Level 3)
- Capital letters, extra spaces, and ’ vs ' don't matter. "oe" counts as "œ".
- The article is optional: "pomme" and "la pomme" both work.
- A missing accent counts, but the game shows the correct spelling ("Presque ! …").
- The wrong article counts too, but the game shows the right one.
- After 3 wrong tries, or "Je ne sais pas", the game shows the answer and adds the word to your review list.

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
| `js/check.js` | Checks typed answers (accents, apostrophes, articles) and le/la/les choices |
| `js/game.js` | Game logic: levels, shelf, clicks, feedback, timer, report |
| `tests/vocab.test.js` | Automatic checks for mistakes in the word list |
| `tests/recipes.test.js` | Checks every recipe is playable |
| `tests/scoring.test.js` | Checks the star rules |
| `tests/check.test.js` | Checks the answer checker |
| `PROCESS_LOG.md` | How AI was used in this project (4D framework log) |

Run the checks with `node --test` (requires Node.js).

## Credits
- Vocabulary: our French class food vocabulary list.
- Built with help from Claude (an AI assistant), which wrote the code to the student's design. All French was checked by the student against the class list. See `PROCESS_LOG.md` for details.
