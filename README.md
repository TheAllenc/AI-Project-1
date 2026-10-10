# La Cuisine 🥖🧀🍓

A browser cooking game that helps French 1–2 students learn **food vocabulary**.
Players read French recipe cards and gather the right ingredients. The levels get harder as you go:

1. **Le Petit-Déjeuner**: click the picture that matches the French word (recognition)
2. **Le Goûter**: also pick the right article: *le / la / l’ / les* (gender)
3. **Le Déjeuner**: see the picture (or an English clue) and type the French word (recall)
4. **Le Dîner**: build a full menu (*l'entrée → le plat principal → le dessert*)
5. **Le Restaurant**: the meal words, the menu words and the verbs, plus more dishes (typing)

Each level picks 3 recipes at random from its pool, so every game is different. **Every one of the 124 words on the vocabulary list is used** (a test checks this), and **📖 Tout le vocabulaire** on the homepage shows them all, with search, categories and 🔊 pronunciation.

**How the game helps words stick** (see `LEARNING_DESIGN.md`):
- **Spaced repetition:** every word has a memory (Leitner boxes 1–5). Right answers move it up and it comes back later; a mistake sends it back to box 1 and it comes back soon.
- **Weak words come back more often:** replaying a level favors recipes with words you struggle with; the mini-games pick their targets the same way.
- **"Question surprise !":** sometimes, on a menu screen, one quick question about a word you've seen (due and weak words first). Right +1 ⭐, wrong or skipped −1 ⭐ (never below 0).
- **Level quizzes:** after a level, a quiz on every word of that level (all 5 quizzes cover all 124 words). Pass at 80%. First try only: pass +10 ⭐, fail −5 ⭐. Unlimited retries.
- **Progress you can see:** the vocabulary page shows how well you know each word, with a "🔁 À revoir" filter.

**Jeux (mini-games)**, unlocked after Level 1:
- **Le Café**: customers order in French ("Pour moi, la pomme et le lait…"); serve them before their patience runs out.
- **La Pluie de Nourriture**: click the falling food that matches the French word.
- **Le Labyrinthe du Chef**: a Pac-Man-style maze. Steer the chef to the food named at the top. Mice chase you, hot stoves 🔥 are traps, and you have 5 hearts.

**Chef Barbe**, the animated mascot, greets you on the homepage and reacts to your stars.

**Stars and the shop:** each recipe earns 1–5 stars. The first time you finish a level, its stars (up to 15) go into your collection; the first time you complete a mini-game you get 1 star. Replaying earns nothing new unless you start over ("Recommencer à zéro" erases levels, stars and clothes). Spend stars (1–6 each) in *La Boutique du Chef* on 21 food-themed clothes, like a cheese hat or a jelly beard. Progress is saved in your browser.

**Look:** a bright, chunky cartoon kitchen inspired by *Overcooked*, with lots of animation (it switches off for players who turn on "reduce motion").

> **Status:** Milestone 5. Play-test version.

## How to play
No install needed. Download the folder and double-click **`index.html`**. It runs in any modern browser.

## Scoring
Each recipe starts at ★★★★★. You lose 1 star per mistake (at most 3) and 1 if you're slower than the target time: 6 seconds per ingredient for clicking, 8 for choosing le/la/l’/les, and 12 for typing. You always get at least ★ for finishing.

## Typing rules
- Capital letters, extra spaces, and ’ vs ' don't matter. "oe" counts as "œ".
- The article is optional: "pomme" and "la pomme" both work.
- A missing accent counts, but the game shows the correct spelling ("Presque ! …").
- The wrong article counts too, but the game shows the right one.
- After 3 wrong tries, or "Je ne sais pas", the game shows the answer and adds the word to your review list.
- Words with no picture show an English clue. A few words have a special clue (in `vocab.js`) when the plain English would be confusing: false friends like *prune* (= plum), look-alikes like *dessert*, or two words with the same English, like *la tartine* and *le pain grillé*.

## Feedback form
In the online version, "Donner mon avis" saves each player's answers privately (only the game's owner can read them, using "Voir les avis"). In the downloaded file, or for viewers who can't save, the form shows the answers as text to copy and send.

## How to change the vocabulary
All words live in **`js/vocab.js`**, which is the only file you need to edit.
Open **`vocab-check.html`** to see every word in a table. Rows marked with an orange bar still need a human to check them.

## Project files
| File | What it does |
|---|---|
| `index.html` | The game page: every screen (title, levels, kitchen, results, shop, mini-games, word list, feedback) |
| `vocab-check.html` | Table of all vocab, for checking accuracy |
| `style.css` | The cartoon-kitchen look: colors, fonts, layout and animations |
| `js/vocab.js` | The word list (from Lawless French, supplied by Dillon Allen) |
| `js/recipes.js` | The levels and their recipes |
| `js/scoring.js` | Star rules (time + mistakes) |
| `js/check.js` | Checks typed answers (accents, apostrophes, articles) and le/la/l’/les choices |
| `js/sound.js` | Sound effects (made by the browser, no files) and the mute button |
| `js/memory.js` | Spaced repetition: each word's Leitner box, when it's due, and weighted picking |
| `js/progress.js` | Saved progress: collected stars, finished levels, the chef's clothes |
| `js/chef.js` | The mascot: clothes list, the SVG drawing, and the chef's messages |
| `js/shop.js` | The chef's shop, the "start over" button, and drawing the chef on each screen |
| `js/maze.js` | Mini-game: Le Labyrinthe du Chef (Pac-Man style) |
| `js/game.js` | Game logic: levels, shelf, clicks, feedback, timer, report, mini-game menu |
| `js/cafe.js` | Mini-game: Le Café |
| `js/falling.js` | Mini-game: La Pluie de Nourriture (falling food) |
| `js/feedback.js` | Play-test feedback form |
| `js/wordlist.js` | "Tout le vocabulaire": every word, with search, categories, pronunciation and mastery |
| `js/quiz.js` | Level quizzes and surprise review questions |
| `tests/vocab.test.js` | Automatic checks for mistakes in the word list |
| `tests/recipes.test.js` | Checks every recipe is playable |
| `tests/scoring.test.js` | Checks the star rules |
| `tests/check.test.js` | Checks the answer checker |
| `tests/progress.test.js` | Checks the star collection and shop rules |
| `tests/chef.test.js` | Checks the clothes list and the chef's messages |
| `tests/memory.test.js` | Checks the spaced-repetition rules |
| `tests/quiz.test.js` | Checks quiz questions (every word asked, one right answer, fair wrong options) |
| `tests/maze.test.js` | Checks the maze: traps don't cut it off, mice chase, food is always reachable |
| `PROCESS_LOG.md` | How AI was used in this project (4D framework log) |
| `CODE_GUIDE.md` | Plain-English walkthrough of the code, for the showcase |
| `LEARNING_DESIGN.md` | The learning science behind the game, and how each idea is used |

Run the checks with `node --test` (requires Node.js).

## Credits
- **Responsibility:** Dillon Allen is responsible for everything this game has to offer. Dillon Allen created it with the help of Claude, a service of Anthropic, which wrote the code to Dillon's design. See `PROCESS_LOG.md` for who did what.
- **Vocabulary:** supplied by Dillon Allen, from Lawless French: https://www.lawlessfrench.com/vocabulary/food/
