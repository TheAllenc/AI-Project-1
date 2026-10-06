# La Cuisine: Code Walkthrough Guide

A plain-English tour of how the game works, so you can explain it at the showcase. Read it with the code open beside it.

## The big picture

The game is three kinds of files:

1. **Data:** *what* the game teaches (`vocab.js`, `recipes.js`)
2. **Rules:** small, testable pieces of logic (`scoring.js`, `check.js`)
3. **Game code:** what you see and click (`game.js`, `cafe.js`, `falling.js`, `feedback.js`, `sound.js`)

`index.html` holds every screen as a `<section>`. Only one is visible at a time: `showScreen(id)` in `game.js` hides all the others. There's no framework and no build step. The browser loads the `<script>` files in order, and they share functions with each other.

```
vocab.js ─┐
recipes.js┼─► game.js ──► cafe.js, falling.js, feedback.js
scoring.js│     ▲
check.js ─┤     │ uses
sound.js ─┘     └── showScreen, shuffle, pictureFoods, addRow…
```

**One-sentence version:** "The word list and recipes are data files; the game reads them, shows one screen at a time, checks each answer with small rule functions, and keeps score in one `state` object."

---

## Data files

### `js/vocab.js`: the word list
- `VOCAB` is a list of 124 words from the Lawless French food vocabulary list (https://www.lawlessfrench.com/vocabulary/food/), which I supplied. Each word is an object:
  `{ id, fr, article, gender, plural, en, emoji, categories }`
- `gender` is stored separately from `article` because *l'* and *les* hide the gender (*l'orange* is feminine).
- `emoji` is `null` when no clear picture exists. Those words only appear in typing rounds, with the English word as the clue.
- `withArticle(word)` turns a word into text like "la pomme" or "l'orange".
- `getWord(id)` finds a word by its id.

### `js/recipes.js`: levels and recipes
- `LEVELS` lists the 4 levels. Each has a `mode` that says how it's played:
  - `click`: read the word, click the picture (Level 1)
  - `gender`: click the picture, then pick le/la/les (Level 2)
  - `type`: type the French word (Level 3)
  - `menu`: three courses, each with its own mode (Level 4)
- Levels 1–3 have **5 recipes**, and `pickRecipes(level)` picks **3 at random** each game. Level 4 has 2 options per course and picks one of each, which makes 8 possible menus.
- **Why random?** Play-testers said the game was boring and short on content, so each replay is now different.

---

## Rule files (the easiest to explain and test)

### `js/scoring.js`: stars
- Start with 3 stars. Lose 1 for any mistake, 1 more for 3+ mistakes, and 1 for being slower than the target time. The minimum is 1.
- The target time is seconds per ingredient: 6 (click), 8 (gender), 12 (type). Typing takes longer, so it gets more time.

### `js/check.js`: is the answer right?
- `checkTyped(input, word)` returns `"correct"`, `"accent"`, `"article"`, or `"wrong"`.
- Steps:
  1. `normalize`: lowercase, trim, one space, ’ → ', œ → oe.
  2. `splitArticle`: separate "la" from "pomme" (the article is optional).
  3. Compare. If only the accents differ, the result is `"accent"`, which counts but is flagged.
- `genderArticle(word)` gives the right le/la/les, even for *l'* and *un* words.

---

## Game code

### `js/game.js`: the main game (Levels 1–4)
- **`state`** is the game's memory: current level, recipe, found ingredients, mistakes, timer, missed words, best scores.
- **Flow:** `showLevels()` → `startLevel(level)` → `startRecipe()` → the player answers → `collect(word)` → `finishRecipe()` → `nextRecipe()` → `showReport()`.
- **The three ways to answer:**
  - `pickFood(word, button)`: a picture was clicked (modes click and gender).
  - `pickArticle(choice)`: le/la/les was clicked (gender mode).
  - `submitTyped()`: the typing box was sent (type mode). It uses `checkTyped`.
- **`currentTarget()`:** the game asks for **one ingredient at a time**, so when you get one wrong, it knows which word you didn't know. `mistake(word)` adds it to the "words to review" list.
- **`drawRecipeCard()`** never gives away the answer: in gender mode it shows "___ fraise"; in type mode it shows the picture or English clue.
- **`startPractice()`** builds a mini "recipe" out of the words you missed.
- **`MINI_GAMES`** and the second half of `showLevels()` show the two mini-games, locked until Level 1 is done.
- **`showModeResult(result)`** is the shared results screen for both mini-games.

### `js/cafe.js`: Le Café
- 8 customers. Each order is 1, then 2, then 3 items (`orderSize`).
- The order sentence uses the class-list articles: "Bonjour ! Pour moi, la pomme et le lait, s'il vous plaît."
- A `setInterval` lowers `cafe.patience` 10 times a second. At 0, `customerLeaves()` runs.
- A wrong item costs 3 seconds of patience. Fast service earns a 2 € tip instead of 1 €.
- `running` and `waiting` flags stop the game from continuing after you quit, and ignore clicks between customers.

### `js/falling.js`: La Pluie de Nourriture
- `requestAnimationFrame(fallStep)` runs every frame. It moves each food down by `speed × time`, adds new foods, and checks whether the target fell past the bottom.
- `spawnFood()` makes the target appear often (60% when it isn't already on screen), so the game is always winnable.
- It gets faster with each catch (`fallSpeed`, `spawnDelay`). You have 3 hearts.

### `js/feedback.js`: the feedback form
- Online (the claude.ai link), each player's answers are saved to `feedback/<their id>` in the page's database. Database rules make them **readable only by the owner**: classmates can't see each other's answers.
- If saving isn't possible (the downloaded file, or a viewer without permission), the form shows a **copy box** instead, so no feedback is lost.
- The owner sees a "Voir les avis" button with averages and every answer.

### `js/sound.js`
- Beeps made by the browser's Web Audio API: no sound files. `playSound("good" | "bad" | "done")`.

---

### `js/progress.js`: collected stars and clothes
- `progress` holds `completed` (levels finished and the stars they gave), `stars` (to spend), `owned` (clothes bought) and `wearing` (one item per slot).
- `earnLevelStars(p, levelId, stars)` adds stars **only the first time** a level is finished, and returns 0 after that. This is the rule that stops players from farming stars by replaying.
- `buyItem` and `toggleWear` are the shop rules. `startOver()` erases everything, clothes included.
- It's saved with `localStorage` (in the player's browser) inside `try/catch`, so the game still works if the browser blocks saving.

### `js/chef.js`: the mascot
- `drawChef(wearing)` builds the chef as SVG text, in layers: body → apron → face → beard → neck item → hat → accessory. Each clothing item in `CLOTHES_SVG` is one small piece of SVG, so dressing him up just swaps pieces in.
- The animation (bobbing, blinking, beard wiggle, a jump for 3 stars) is CSS in `style.css`.
- `chefSays(stars)` picks a message that matches 1, 2 or 3 stars. `moodForTotal` turns a level total (e.g. 7/9) into a 1–3 mood.

### `js/shop.js`: the shop
- `renderChefs()` redraws every chef on the page (anything with class `chef-slot`) in his current clothes.
- `showChefReaction()` puts the chef and his message next to the stars.
- The "start over" button shows its own confirmation box, because browser pop-up confirmations are blocked on the published page.

### `js/maze.js`: Le Labyrinthe du Chef
- `MAZE` is the map as text: `#` is a wall and `.` is a path.
- Pac-Man movement: the arrow keys set `chef.next`; every 170 ms `chefStep()` turns if it can, then moves one square. The chef keeps going until a wall.
- Mice move every 340 ms. `mouseDirection()` never turns straight back, and half the time it heads toward the chef.
- `pickFoodSquares()` uses a breadth-first search (`canReach`) to make sure the right food can always be reached **without walking over another food**, so the game is always fair.
- The board is HTML squares (not a canvas), so the chef wears the same SVG clothes as everywhere else.

## Tests (`tests/`)

Run `node --test`. There are 52 automatic checks, including:
- **Vocab:** no duplicate ids; articles match genders; no two words share an emoji.
- **Recipes:** every ingredient exists; picture levels only use words with emoji; English clues never equal the French answer; each game picks 3 different recipes.
- **Scoring and checking:** star rules and accent/article rules give the expected answers.
- **Progress:** a level's stars count only once; you can't buy what you can't afford.
- **Maze:** every path square is reachable, and in 2,000 random layouts the right food is always reachable without touching another one.

**Why tests matter for the 4D framework (Diligence):** they catch mistakes automatically every time something changes. A real example: a test blocks any picture-level recipe that uses a word with no emoji.

---

## Questions you might be asked (with answers)

**"Did you write the code?"**
The AI (Claude) wrote the code to my design, one milestone at a time. I chose the audience, the game type, the progression, the scoring features, the vocab source (Lawless French), and the new modes after play-testing. I play-tested each milestone. *(Be specific and honest. Your PROCESS_LOG shows exactly who did what.)*

**"How does it know if a typed answer is right?"**
`checkTyped` in `check.js` cleans up the answer (capitals, spaces, apostrophes, "oe" for "œ"), removes an optional article, and compares. If only accents differ, it counts but shows the correct spelling.

**"How do you know the French is correct?"**
All words come from the Lawless French food vocabulary list, which I supplied. The AI flagged things it wasn't sure about (genders of *l'* words, missing footnotes, the meaning of *déjeuner*), and I answered them. *(If you check more with your teacher, say so here.)*

**"Why one ingredient at a time?"**
So the game knows which word you were looking for when you clicked the wrong picture, and can put it on your review list.

**"What happens when you click the wrong food?"**
It counts as a mistake, but the game tells you what you clicked ("Ça, c'est le canard"), so you still learn a word.

**"What changed after play-testing?"**
Three friends said it was boring and needed more to do, and one suggested new game modes. I added two mini-games (Le Café and falling food) and more recipes, chosen at random so every game is different.

**"Where is progress saved?"**
Collected stars, finished levels and the chef's clothes are saved in the player's own browser (`localStorage`). Feedback answers are saved online, and only I can read them.

**"Can't players just replay a level to get more stars?"**
No. `earnLevelStars` only gives a level's stars the first time. The only way to earn them again is "start over", which also erases the clothes you bought.
