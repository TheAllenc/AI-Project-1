# Plan: "La Cuisine" — French Food Vocab Cooking Game

## Context
Senior AI-class project at Blair: build an educational simulation for classmates and document the work with the **4D framework** (Delegate, Describe, Discern, Diligence). Topic: helping **French 1–2** students memorize **food vocabulary** through a **cooking/recipe game**. The vocab comes from the student's own French class list (pasted in chat). Constraints: due in **2–3 weeks**, the student **must be able to explain the code** at the showcase, and the game needs **scores and progress feedback**. Repo `theallenc/ai-project-1` is empty (only a placeholder `Project` file); work happens on branch `claude/french-food-vocab-game-d3qmre`.

## Decisions made
| Topic | Choice |
|---|---|
| Audience | French 1–2 beginners |
| Game type | Cooking/recipe game: read a French recipe card and gather the ingredients |
| Platform | Browser game in plain HTML/CSS/JavaScript. No frameworks, no build step, and it opens by double-clicking `index.html` |
| Art | Food emoji |
| Vocab source | The class list as pasted (source of truth) |
| Progression | Escalating levels: recognition (click) → gender (le/la/les) → recall (typing) |
| Accents | Accept answers with a missing accent, but flag them ("Presque ! N'oublie pas l'accent : **œuf**"). On-screen buttons for é è ê à ç ô û î œ |
| Scoring | 1–3 stars per recipe (accuracy + timer) and an end-of-level report of missed words |
| Workflow | Step-by-step milestones. The student play-tests each one before we move on |

## Game design

**Levels follow the meals on the class list**, so the meal words get used too:
1. **Le Petit-Déjeuner (recognition).** A French recipe card lists the ingredients with articles ("la confiture, le beurre, le pain"). The player clicks the matching emoji on a kitchen shelf that also holds distractors. Recipes: tartine, crêpes.
2. **Le Goûter (gender).** Each correct ingredient also needs the right article: **le / la / les**. Words written with *l'* still need the hidden gender, which is where beginners struggle most. Recipes: salade de fruits, gâteau au chocolat.
3. **Le Déjeuner (recall).** An emoji appears and the player types the French word. Accent buttons and accent-tolerant checking apply. Recipes: omelette, soupe de légumes, pâtes.
4. **Le Dîner (full menu).** Build *l'entrée → le plat principal → le dessert* using mixed click and typing under a timer. Recipes: ratatouille, poulet rôti, mousse au chocolat / tarte aux fraises.

Each level unlocks after the previous one is finished. That progress lasts for the session only; saving it across visits wasn't requested.

**End-of-level report:** stars earned, time taken, and a table of missed words (emoji · article + French · English) with a **"Pratiquer ces mots"** button that replays only the missed words.

## File structure (kept small so the student can explain every file)
```
index.html          screens: title, level select, kitchen, report
style.css           layout, colors, animations
js/vocab.js         THE word list. The only file needed to change vocab
js/recipes.js       recipes per level, each a list of vocab ids
js/check.js         answer checking (normalize, accent tolerance, apostrophes)
js/game.js          game state, level flow, timer, stars, report
tests/check.test.js Node tests for check.js (node --test)
README.md           how to play, how to edit vocab, credits
PROCESS_LOG.md      running 4D log: what was delegated, the prompts used, AI errors caught, decisions
```
Plain `<script>` tags, no ES modules, so the game works from `file://` on a school laptop with no server.

**Vocab entry shape** (`js/vocab.js`):
```js
{ id: "pomme", fr: "pomme", article: "la", gender: "f", plural: false,
  en: "apple", emoji: "🍎", category: "fruits" }
```
`gender` is stored separately from `article`, so `l'abricot` still knows it is masculine.

**Answer checking** (`js/check.js`): lowercase and trim the input, collapse spaces, treat curly `’` and straight `'` as the same (the class list uses `’`), accept `oe` for `œ`, and make the article optional when typing. A result is one of `correct`, `accent` (right except accents → counts, but flagged), or `wrong`.

## Things I noticed in the class list (Discern checkpoints for you to verify)
I won't change the list on my own. Please check these with your French teacher:
1. **Gender of *l'* words isn't written on the list.** The game needs it. I'll fill it in from standard French (e.g. *l'orange* f, *l'aubergine* f, *l'huile* f, *l'ail* m, *l'oignon* m) and mark each one `// VERIFY` for you to confirm.
2. **Footnotes `l'entrée*` and `des œufs**`:** the footnote text is missing. What do they say?
3. **Duplicates:** *le fromage* and *la glace* each appear twice (dairy and dessert). I'll store each once and let it appear in both categories.
4. **"to have breakfast / to have lunch → déjeuner":** in France, *déjeuner* usually means lunch (breakfast is *prendre le petit-déjeuner*). In Québec, *déjeuner* means breakfast. Is this intentional? It only affects the verbs, which the game mostly doesn't use.
5. **Kitchen tools & actions** (you picked this category) **are not on the class list.** Option: add a small set (*la poêle, le couteau, le bol, couper, mélanger, cuire*) clearly labeled "extra: not from class list" and verified by you. Otherwise we drop it.
6. **Emoji gaps:** some words have no good emoji (fig, pomegranate, artichoke, leek, beet, radish, arugula, yam, buttermilk, veal, crème fraîche, fromage blanc, prune, raisin sec…). Those words go in the **typing/translation** rounds only (English cue instead of a picture) and stay out of picture rounds. That way no picture is misleading.
7. Small notes: *les frites* = "chips" in British English, "fries" in American English (I'll show "fries / chips"). *le poisson* sits under *La viande*; the game will keep it there.

## Milestones (each ends with you play-testing and giving feedback)
- **M0, Setup & data (days 1–2):** skeleton files, README, `PROCESS_LOG.md`, and the full vocab list transcribed into `js/vocab.js`. **You verify every entry** (gender, accents, spelling), which is your main Discern evidence.
- **M1, Core loop (days 3–5):** Level 1 playable with one recipe: recipe card, clickable shelf, right/wrong feedback, recipe complete.
- **M2, Progression & scoring (days 6–8):** level select, all Level 1–2 recipes, timer, stars, end-of-level report with "practice missed words".
- **M3, Gender + typing (days 9–11):** Level 2 article choice, Level 3 typing with accent buttons and `check.js` plus its tests.
- **M4, Full menu & polish (days 12–14):** Level 4, animations, mobile/laptop layout, sound effects if time allows.
- **M5, Play-test & ship (days 15+):** 2–3 classmates play it while you record what confused them, then we fix it, publish a shareable link (GitHub Pages or a claude.ai artifact), and prepare showcase talking points.

Stretch goals (only if ahead of schedule): French text-to-speech pronunciation (built into the browser, free), saving progress in the browser.

**Answers from the vocab check:** genders accepted as filled in; *l'entrée* = starter, *des œufs* = eggs; *déjeuner* (verb) = to have lunch; kitchen tools & actions **dropped** (class list only).

## 4D framework, built into the process
- **Delegate:** AI writes the code and drafts recipes. You own the vocab accuracy, the game design decisions, play-testing, and the final call on everything.
- **Describe:** each milestone starts with you describing what you want. We save the good prompts in `PROCESS_LOG.md`.
- **Discern:** you verify the vocab data (the checkpoints above), play-test each milestone, and log any AI mistakes you catch.
- **Diligence:** the README credits AI assistance honestly, the French is verified against your class list and teacher, and you can explain every file.

## Verification
- `node --test` runs the answer-checker tests: accent tolerance, `’` vs `'`, `oe`/`œ`, optional article, wrong answers.
- Open `index.html` directly in Chromium (Playwright, headless) and take screenshots of each screen to confirm the loop works: click the right ingredient → feedback → recipe complete → stars → report.
- Manual play-through of every level by you after each milestone.
- Commit and push each milestone to `claude/french-food-vocab-game-d3qmre`.
