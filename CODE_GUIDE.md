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
sound.js, voice.js ─┘     └── showScreen, shuffle, pictureFoods, addRow…
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
  - `gender`: click the picture, then pick le/la/l’/les (Level 2)
  - `type`: type the French word (Level 3)
  - `menu`: three courses, each with its own mode (Level 4)
- Every level has a pool of recipes, and `pickRecipes(level)` picks **3 at random** each game. Level 4 picks one option per course (3 entrées, 5 main courses, 4 desserts).
- Level 5, *Le Restaurant*, holds the meal words, menu words and verbs, so **every word in `vocab.js` is used somewhere**. A test fails if any word is left out.
- Some words have a `clue` in `vocab.js`: the English hint used in typing rounds when the plain English would confuse players (false friends like *prune*) or give the answer away (*dessert*).
- **Why random?** Play-testers said the game was boring and short on content, so each replay is now different.

---

## Rule files (the easiest to explain and test)

### `js/scoring.js`: stars
- Start with 5 stars (`MAX_STARS`). Lose 1 per mistake (at most 3) and 1 for being slower than the target time. The minimum is 1.
- The target time is seconds per ingredient: 6 (click), 8 (gender), 12 (type). Typing takes longer, so it gets more time.

### `js/check.js`: is the answer right?
- `checkTyped(input, word)` returns `"correct"`, `"accent"`, `"article"`, or `"wrong"`.
- Steps:
  1. `normalize`: lowercase, trim, one space, ’ → ', œ → oe.
  2. `splitArticle`: separate "la" from "pomme" (the article is optional).
  3. Compare. If only the accents differ, the result is `"accent"`, which counts but is flagged.
- `definiteArticle(word)` gives the right answer for Level 2: **le, la, l' or les**. Before a vowel French uses *l'* (*l'orange*, *l'ananas*, *l'oignon*), so that's the answer there. `startsWithVowel` leaves out "y" on purpose (*le yaourt*), and *le hors d'œuvre* keeps "le" because its h is "aspiré".
- `hiddenGenderTip(word)`: *l'* hides the gender, so after a correct *l'* the game adds "orange est féminin : une orange".

---

## Game code

### `js/game.js`: the main game (Levels 1–4)
- **`state`** is the game's memory: current level, recipe, found ingredients, mistakes, timer, missed words, best scores.
- **Flow:** `showLevels()` → `startLevel(level)` → `startRecipe()` → the player answers → `collect(word)` → `finishRecipe()` → `nextRecipe()` → `showReport()`.
- **The three ways to answer:**
  - `pickFood(word, button)`: a picture was clicked (modes click and gender).
  - `pickArticle(choice)`: le/la/l'/les was clicked (gender mode). If the word starts with a vowel and you pick wrong, the hint reminds you.
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

### `js/voice.js`: the game speaks French
- Uses the browser's built-in voice (`speechSynthesis`), so there are no sound files and it works offline. `frenchVoice()` picks a France-French voice if the computer has one.
- `speakFrench(text)` is called wherever French appears: the word to find (Level 1), the noun without its article (Level 2, so it doesn't give away le/la/l'/les), the answer after you get it right, the café orders and "Merci ! Au revoir !", the falling-food and maze targets, quiz questions, and Chef Barbe's reactions.
- **It never reads an answer before you give it:** Level 3 typing and "how do you say it in French?" questions stay silent until you answer (`forgetVoice()` also empties the 🔁 button).
- `frenchPart("Bravo ! (Well done!)")` → `"Bravo !"`: the chef's lines are "French (English)", and the voice only reads the French.
- Options: `{ force: true }` speaks even when the voice is off (the 🔊 buttons you click on purpose); `{ queue: true }` waits for the sentence before it, so "l'orange" isn't cut off by the next word; `{ slow: true }` is the 🐢 button.
- 🗣️ turns the voice on or off (saved in `localStorage`). 🔁 replays the last sentence, and 🐢 says it slowly. If the browser can't speak, these buttons are hidden.

---

### `js/progress.js`: collected stars and clothes
- `progress` holds `completed` (levels finished and the stars they gave), `stars` (to spend), `owned` (clothes bought) and `wearing` (one item per slot).
- `earnLevelStars(p, levelId, stars)` adds stars **only the first time** a level is finished, and returns 0 after that. This is the rule that stops players from farming stars by replaying.
- `buyItem` and `toggleWear` are the shop rules. `startOver()` erases everything, clothes included.
- It's saved with `localStorage` (in the player's browser) inside `try/catch`, so the game still works if the browser blocks saving.
- **Save codes:** `encodeSave(progress)` turns the progress into text: `CUISINE1-` + the progress as base64 + `-` + a checksum. `decodeSave(code)` checks the start, recomputes the checksum (`checksum()`, the short "djb2" hash) and only then reads the progress. A typo or a missing piece gives a friendly error instead of broken progress. The checksum catches accidents, not cheating: there's no server, so a determined player could still edit their own code.
- `saveSummary(p)` writes "⭐ 17 · 2 niveaux finis · 1 vêtement" (French uses the singular for 0 and 1).

### `js/save.js`: the save screen
- `showSave()` fills the box with your code. `copySaveCode()` copies it; if the browser blocks copying, it selects the code so you can press Ctrl+C.
- Loading takes **two steps**: `checkSaveCode()` checks the code and shows what's in it next to what's on this computer, then `loadSaveCode()` replaces the progress only after "Oui".
- Why no sign-in? Accounts would mean storing students' names and passwords on a server, which brings privacy rules for a school project. A code gives the same result with no student data.

### `js/wordlist.js`: all the vocabulary
- `showWordList()` draws a card for every word in `VOCAB`. The category chips and the search box filter them (`matchesSearch` ignores accents and capitals).
- Each card's 🔊 button calls `speakFrench(word, { force: true })` from `voice.js`.

### `js/chef.js`: the mascot
- `drawChef(wearing)` builds the chef as SVG text, in layers: body → apron → face → beard → neck item → hat → accessory. Each clothing item in `CLOTHES_SVG` is one small piece of SVG, so dressing him up just swaps pieces in. A beard item (jelly, chocolate, spaghetti, cotton candy) replaces his brown beard.
- The animation (bobbing, blinking, beard wiggle, a jump for 3 stars) is CSS in `style.css`.
- `chefSays(stars)` picks a message that matches 1, 2 or 3 stars. `moodForTotal` turns a level total (e.g. 7/9) into a 1–3 mood.

### `js/shop.js`: the shop
- `renderChefs()` redraws every chef on the page (anything with class `chef-slot`) in his current clothes.
- `showChefReaction()` puts the chef and his message next to the stars.
- The "start over" button shows its own confirmation box, because browser pop-up confirmations are blocked on the published page.

### `js/maze.js`: Le Labyrinthe du Chef
- `MAZE` is the map as text: `#` is a wall, `.` is a path, and `x` is a trap (a hot stove; stepping on it costs a heart).
- Pac-Man movement: the arrow keys set `chef.next`; every 170 ms `chefStep()` turns if it can, then moves one square. The chef keeps going until a wall.
- Mice move every 300 ms and **chase** the chef. `distancesFrom(chef)` does a breadth-first search to find how many steps every square is from the chef; `mouseDirection()` then takes the step with the smallest number (75% of the time; otherwise it wanders, so you can escape). Mice never step on traps or turn straight back.
- `pickFoodSquares()` uses a breadth-first search (`canReach`) to make sure the right food can always be reached **without walking over another food**, so the game is always fair.
- The board is HTML squares (not a canvas), so the chef wears the same SVG clothes as everywhere else.

### `js/memory.js`: spaced repetition (the "brain" of the game)
- Each word has a record: its **box** (0 = new, 1 = struggling … 5 = mastered), how often it was seen, right, and wrong, and when it was last seen.
- `recordAnswer()` moves a word up a box when it's right, or back to box 1 when it's wrong.
- `isDue()`: has the word's waiting time passed (2 min for box 1 … 3 days for box 5)?
- `wordWeight()`: how likely the word is to be picked. Struggling and due words weigh the most.
- `pickWeighted()`: picks items at random, but heavy items more often. It's used to choose recipes (`pickRecipes`), café orders, falling-food targets and maze targets.
- `game.js` calls `remember(wordId, correct)` after every answer in the game.

### `js/quiz.js`: quizzes and surprise questions
- `buildQuestion(word, kind)` makes a 4-option question: French → English, picture/English → French, or **listen** (hear the word, nothing written, pick the English). Wrong options come from the same category and never mean the same thing as the answer. `speak` says what the voice reads, and it's empty when reading would give the answer away.
- `questionKinds()` only adds listening questions when the browser can speak and the voice is on.
- `buildLevelQuiz(level)` asks about **every** word in all of the level's recipes (`levelWords`).
- `recordQuiz()` (progress.js) gives +10 ⭐ for passing (80%) or −5 ⭐ for failing, **only on the first try**. Leaving a first try early counts as finishing it.
- `maybeSurprise()` runs every time `showScreen()` changes screen. On menu screens only, with a 35% chance and a 45-second cooldown, it asks about a word picked by `chooseReviewWord()` (due and weak words first). Right +1 ⭐, wrong or skipped −1 ⭐; `changeStars()` never goes below 0.

## Tests (`tests/`)

Run `node --test`. There are 90 automatic checks, including:
- **Vocab:** no duplicate ids; articles match genders; no two words share an emoji.
- **Recipes:** every ingredient exists; picture levels only use words with emoji; English clues never equal the French answer; each game picks 3 different recipes.
- **Scoring and checking:** star rules and accent/article rules give the expected answers.
- **Progress:** a level's stars count only once; you can't buy what you can't afford; a save code brings back exactly the same progress, and a code with a typo is refused.
- **Maze:** traps never cut the map apart; mice avoid traps; a chasing mouse reaches a still chef by the shortest path; in 2,000 random layouts the right food is always reachable without touching a trap or another food.
- **Vocabulary:** every word on the list appears in a recipe, and no typing clue gives away its answer.
- **Memory:** right answers move words up, mistakes send them to box 1, waiting times grow, and struggling words are picked far more often than mastered ones.
- **Quizzes:** every level quiz asks every word once; every question has exactly one right answer; first-try-only stars; stars never below 0; listening questions don't show the word, and the voice never reads the answer to a "say it in French" question.
- **Articles:** every word starting with a vowel takes *l'* in Level 2 (except *le yaourt* and *le hors d'œuvre*).
- **Voice:** the voice reads only the French part of the chef's messages.

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

**"Do words come back? How does the game help people remember?"**
Yes. Every word has a Leitner box (spaced repetition). Mistakes send a word back to box 1, so it comes back soon in recipes, mini-games and surprise questions; words you know come back less and less often. Each level ends with a quiz on all its words. See `LEARNING_DESIGN.md`.

**"Can't players just replay a level to get more stars?"**
No. `earnLevelStars` only gives a level's stars the first time. The only way to earn them again is "start over", which also erases the clothes you bought.
