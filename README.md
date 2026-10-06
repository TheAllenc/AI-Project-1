# La Cuisine 🥖🧀🍓

A browser cooking game that helps French 1–2 students learn **food vocabulary**.
Players read French recipe cards and gather the right ingredients. The levels get harder as you go:

1. **Le Petit-Déjeuner**: click the picture that matches the French word (recognition)
2. **Le Goûter**: also pick the right article: *le / la / les* (gender)
3. **Le Déjeuner**: see the picture and type the French word (recall)
4. **Le Dîner**: build a full menu (*entrée → plat principal → dessert*) against the clock

Each level picks 3 of its 5 recipes at random (Level 4 picks one of two options per course), so every game is different.

**Jeux (mini-games)**, unlocked after Level 1:
- **Le Café**: customers order in French ("Pour moi, la pomme et le lait…"); serve them before their patience runs out.
- **La Pluie de Nourriture**: click the falling food that matches the French word before it reaches the bottom.

> **Status:** Milestone 5. Play-test version with a feedback form ("Donner mon avis").

## How to play
No install needed. Download the folder and double-click **`index.html`**. It runs in any modern browser.

## Scoring
Each recipe starts at ★★★. You lose 1 star for any mistake, 1 more for 3 or more mistakes, and 1 if you're slower than the target time: 6 seconds per ingredient for clicking (Level 1), 8 for choosing le/la/les (Level 2 and the entrée), and 12 for typing (Level 3, the plat principal and the dessert). You always get at least ★ for finishing.

## Typing rules (Level 3 and the Level 4 plat principal and dessert)
- Capital letters, extra spaces, and ’ vs ' don't matter. "oe" counts as "œ".
- The article is optional: "pomme" and "la pomme" both work.
- A missing accent counts, but the game shows the correct spelling ("Presque ! …").
- The wrong article counts too, but the game shows the right one.
- After 3 wrong tries, or "Je ne sais pas", the game shows the answer and adds the word to your review list.

## Feedback form
In the online version, "Donner mon avis" saves each player's answers privately (only the game's owner can read them, using "Voir les avis"). In the downloaded file, or for viewers who can't save, the form shows the answers as text to copy and send.

## How to change the vocabulary
All words live in **`js/vocab.js`**, which is the only file you need to edit.
Open **`vocab-check.html`** to see every word in a table. Rows marked with an orange bar still need a human to check them.

## Project files
| File | What it does |
|---|---|
| `index.html` | The game page: title, level select, kitchen, "recipe finished", and report screens |
| `vocab-check.html` | Table of all vocab, for checking accuracy |
| `style.css` | Colors and layout |
| `js/vocab.js` | The word list (from Lawless French, supplied by Dillon Allen) |
| `js/recipes.js` | The levels and their recipes |
| `js/scoring.js` | Star rules (time + mistakes) |
| `js/check.js` | Checks typed answers (accents, apostrophes, articles) and le/la/les choices |
| `js/sound.js` | Sound effects (made by the browser, no files) and the mute button |
| `js/game.js` | Game logic: levels, shelf, clicks, feedback, timer, report, mini-game menu |
| `js/cafe.js` | Mini-game: Le Café |
| `js/falling.js` | Mini-game: La Pluie de Nourriture (falling food) |
| `js/feedback.js` | Play-test feedback form |
| `tests/vocab.test.js` | Automatic checks for mistakes in the word list |
| `tests/recipes.test.js` | Checks every recipe is playable |
| `tests/scoring.test.js` | Checks the star rules |
| `tests/check.test.js` | Checks the answer checker |
| `PROCESS_LOG.md` | How AI was used in this project (4D framework log) |
| `CODE_GUIDE.md` | Plain-English walkthrough of the code, for the showcase |

Run the checks with `node --test` (requires Node.js).

## Credits
- **Responsibility:** Dillon Allen is responsible for everything this game has to offer. Dillon Allen created it with the help of Claude, a service of Anthropic, which wrote the code to Dillon's design. See `PROCESS_LOG.md` for who did what.
- **Vocabulary:** supplied by Dillon Allen, from Lawless French: https://www.lawlessfrench.com/vocabulary/food/
