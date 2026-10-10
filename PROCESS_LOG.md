# Process Log: 4D Framework

A running record of how AI was used to build *La Cuisine*. Add to it after every work session; it feeds the unit reflections.

---

## Session 1: Planning + Milestone 0 (setup & vocab data)

### Delegate: who does what
| Me (student) | AI (Claude) |
|---|---|
| Chose the topic, audience (French 1–2), game type (cooking/recipe), and visual style (emoji) | Asked clarifying questions, proposed options, and wrote the plan |
| Provided the vocab list from my French class | Transcribed the list into `js/vocab.js` |
| **Verify every word** (spelling, accents, gender) | Flagged entries it was unsure about with a `verify` note |
| Play-test each milestone and decide what changes | Writes the code one milestone at a time |

**Why I delegated this way:** I need to be able to explain the code at the showcase, so we're building in small milestones I can test and understand. I kept the French accuracy for myself (with my teacher), because AI can get French wrong.

### Describe: key decisions I gave the AI
- Audience: French 1–2 beginners
- Game: read a French recipe → pick ingredients. Levels escalate from clicking pictures → choosing le/la/les → typing the word.
- Platform: browser game (HTML/JS), playable from a link on school laptops
- Accents: accept a missing accent but show the correct spelling
- Scoring: stars + timer per recipe, end-of-level report of missed words
- Vocab: **my class list only**, so the AI should not invent words

### Discern: things the AI flagged for me to check
*(Fill in the "What I found" column after checking with my teacher.)*

| # | Issue the AI raised | What I found |
|---|---|---|
| 1 | Gender for words starting with *l'* or *les* isn't on the class list. The AI filled it in (e.g. *l'orange* = f, *l'ail* = m) | Accepted the AI's genders as they are |
| 2 | Footnotes on *l'entrée\** and *des œufs\*\** are missing their text | *l'entrée* = the starter; *des œufs* = eggs. Updated the English for *l'entrée* to "starter" |
| 3 | *le fromage* and *la glace* appear twice (dairy + dessert) | Kept once, listed under both categories |
| 4 | *déjeuner* listed for both "to have breakfast" and "to have lunch" (France vs. Québec?) | *déjeuner* = to have lunch. Fixed |
| 5 | Kitchen tools & actions aren't on the class list. Add an extra set, or drop the category? | Dropped. The game sticks to the class list |
| 6 | Some words have no good emoji, so they'll only appear in typing rounds | Fine |
| 7 | *les frites* = "chips" (British) → shown as "fries / chips" | |
| 8 | *la tartine* and *le pain grillé* are both "toast" | |

**Mistakes I caught in the AI's work:**
- *(Session 10)* Level 2 asked for **"la orange"** and **"le ananas"**. A French teacher play-testing the game caught it: before a vowel it's always *l'*. See Session 10.

### Diligence
- The README credits AI help and the vocab source.
- Automated tests (`tests/vocab.test.js`) catch data mistakes like duplicate ids, articles that don't match gender, or two words with the same emoji.
- Nothing ships until I've checked every word in `vocab-check.html`.

---

## Session 2: Vocab answers + Milestone 1 (core loop)

### Discern: my answers to the vocab check
Recorded in the Session 1 table above. Kitchen tools & actions were dropped so the game uses only the class list.

### Describe: what Milestone 1 should do
One playable recipe. The player reads the French ingredient list, clicks the matching pictures on a shelf with distractors, gets right/wrong feedback, and sees a "recipe finished" screen.

### Design decisions the AI made (for me to review)
- **Recipe changed from the plan:** Level 1 is the picture level, but *la confiture*, *la farine* and *le sucre* have no emoji. So the first recipe is **une tartine au miel** (le pain, le beurre, le miel) instead of a jam tartine or crêpes.
- **Wrong clicks still teach a word:** "Non ! Ça, c'est le canard. (That's duck.)"
- **"C'est prêt !" instead of "est prête !"**, so the message is correct for masculine and feminine dishes.
- A new test checks that every picture-level ingredient has an emoji, so this kind of problem gets caught automatically.

### Play-test notes (fill in after playing)
- What felt good:
- What was confusing:
- What I want changed:

---

## Session 3: Milestone 2 (progression & scoring)

### Describe: what Milestone 2 should do
Level select, more recipes, a timer, 1–3 stars per recipe, and an end-of-level report listing missed words with a "Pratiquer ces mots" button.

### Design decisions the AI made (for me to review)
- **One ingredient at a time.** The recipe card now points (➜) at the ingredient to find next ("Trouve : le beurre"). Without this, the game couldn't tell which word you didn't know when you clicked a wrong picture. Now every wrong click adds that word to the report.
- **Level 1 recipes:** une tartine au miel, un chocolat chaud et un croissant, une omelette au fromage. Every ingredient has an emoji.
- **Star rules** live in `js/scoring.js`. You lose a star for any mistake, another for 3+ mistakes, and one for going over the target time of 6 s per ingredient. The minimum is 1 star.
- **Levels 2–4 show "Bientôt" (coming soon).** Their recipes come with their new mechanics in Milestones 3–4, so Level 2 isn't just a repeat of Level 1.
- **Best scores last only until you close the page**, as planned. Saving progress was a stretch goal.

### Play-test notes (fill in after playing)
- Is 6 seconds per ingredient too easy or too hard?
- What felt good:
- What was confusing:
- What I want changed:

---

## Session 4: Milestone 3 (gender + typing)

### Describe: what Milestone 3 should do
Level 2: pick **le / la / les** for each ingredient. Level 3: type the French word, with accent buttons and the accent rule from the plan (accept a missing accent, but show the correct spelling).

### Design decisions the AI made (for me to review)
- **Level 2 hides the article** on the recipe card ("___ fraise"). You click the picture, then choose le/la/les. For *l'* words the answer is the hidden gender (*l'orange* → **la**), and the game explains it: "(orange est féminin)". A wrong article counts as a mistake, and you try again.
- **Level 3 clue:** the emoji, or the English word in quotes when there's no emoji. A test makes sure the English clue is never the same as the answer (e.g. *sauce* can't be used).
- **Typing rules:** a missing accent or wrong article still counts but is flagged. Three wrong tries, or "Je ne sais pas", shows the answer and adds the word to the review list.
- **"oe" is accepted as "œ"** with no flag, since it's a joined letter, not an accent, and hard to type.
- **More time for harder levels:** 6 s per ingredient (click), 8 s (gender), 12 s (typing).
- **Recipes:** Level 2: salade de fruits, coupe glacée, goûter d'anniversaire. Level 3: sandwich jambon-beurre, soupe de légumes, pâtes à la tomate. (The omelette was already in Level 1, so Level 3 got the jambon-beurre instead.)
- **Recipe names aren't on the class list** (omelette, salade de fruits, etc.); only the ingredients are. Check that the recipe names read naturally to a French 1–2 student.

### Play-test notes (fill in after playing)
- Are 3 tries in Level 3 the right number?
- What felt good:
- What was confusing:
- What I want changed:

---

## Session 5: Milestone 4 (full menu + polish)

### Describe: what Milestone 4 should do
Level 4, *Le Dîner*: build a full menu (*l'entrée → le plat principal → le dessert*) mixing the earlier skills. Then polish: animations, phone layout, and sound effects if there's time.

### Design decisions the AI made (for me to review)
- **Each course uses a different skill:** l'entrée = *une salade composée* (le/la/les), le plat principal = *un poulet rôti aux légumes* (typing), le dessert = *une tarte aux fraises* (typing). The dessert finally uses *la farine* and *le sucre*, which have no emoji.
- **Course names come from the class list** (*l'entrée, le plat principal, le dessert*) and show in the header and on the "Maintenant : le plat principal →" button.
- **"Against the clock"** uses the same timer and target time as the other levels, with no separate countdown.
- **Practice after Level 4 is typed**, since the menu mixes modes.
- **Sound effects** are made by the browser (no files): a ding, a buzz, and a short tune. A 🔊 button mutes them. Sound starts **on**; tell the AI if it should start off for class.
- **Animations:** food drops into the bowl and stars pop in. They turn off automatically for players whose computer asks for less motion.
- **Title screen** now explains how to play each level.

### Play-test notes (fill in after playing)
- Should sound start on or off?
- What felt good:
- What was confusing:
- What I want changed:

---

## Session 6: Milestone 5 (play-testing and changes)

### Discern: what play-testers said (my notes)
- Friend 1: "It's boring, not a lot of content"
- Friend 2: "Needs more to do, it's not very fun"
- Friend 3: "I think you should add different gamemodes, such as mix and match, to make it more fun."

### Decisions I made from that feedback
- **Add two new game modes:** *Le Café* (customer rush) and *Falling food*. The AI offered four options (mix & match, Le Café, speed round, falling food). I picked these two instead of mix & match.
- **Add more recipes:** about 2 more per level.
- **The new modes unlock after Level 1**, so players see the words first. (The AI had recommended making them open from the start.)
- **Sound stays on** by default.
- **Feedback from classmates** goes through an online form.
- **For the showcase:** a code walkthrough guide (`CODE_GUIDE.md`).

### Design decisions the AI made (for me to review)
- **Random recipes:** each level now has 5 recipes and picks 3 at random every game; Level 4 picks one of two options for each course. This adds content without making levels longer.
- **New recipes:** assiette de fruits, bol de fruits au miel, panier de fruits d'été, plateau de desserts, steak-frites, ratatouille, soupe à l'oignon, canard à l'orange, mousse au chocolat.
- **Le Café:** 8 customers, orders grow from 1 to 3 items, a patience bar, tips in euros, and 3 angry customers end the round.
- **Falling food:** click the falling food that matches the word; it speeds up; 3 hearts.
- **Feedback form:** anonymous. Online answers are private to me. If saving isn't possible, players get a copy box instead.

### French to check (Discern)
- **Café order phrasing:** "Bonjour ! Pour moi, la pomme et le lait, s'il vous plaît." It uses the articles from the class list (le/la/les) instead of *un/du/de la*. Does it sound natural?
- **Singular orders:** some orders sound odd in the singular (e.g. "la myrtille" for one blueberry).
- **New recipe names** (not on the class list), e.g. *un panier de fruits d'été*, *un plateau de desserts*.

### Play-test round 2 (fill in after classmates use the feedback form)
- Average fun (1–5):
- Average learned (1–5):
- Most common confusion:
- What I changed because of it:

---

## Session 7: AI-use disclaimer and making the game more fun

### Diligence: being clear about AI use (my request)
I asked for a disclaimer at the bottom of the homepage saying that **I, Dillon Allen, am responsible for everything this game has to offer**, that I created it **with the help of Claude, a service of Anthropic**, and that **I supplied the French vocabulary, from Lawless French** (https://www.lawlessfrench.com/vocabulary/food/). The README, `vocab.js` and the code guide now give the same source. (Earlier notes in this log say "class list"; the list I supplied is the Lawless French food vocabulary.)

### Fun: my ideas after play-testing
1. **A mascot:** an animated chef with a large beard, at the top of the main menu, and next to the stars after each recipe with a message that matches how well you did (3 stars: "great work"; 1 star: "try again, you got this!").
2. **A Pac-Man-style mode** where you play as the chef, move around a maze, and collect the food named at the top of the screen.
3. **Collectible stars:** stars you earn add up, but a level only gives stars the first time you finish it, unless you completely start over. Stars buy clothes for the chef, shown on the main menu and in the maze game.

### Design decisions the AI made (for me to review)
- **Mascot name:** "Chef Barbe" (*barbe* = beard). He's drawn in SVG with a bobbing, blinking, beard-wiggling animation, and he jumps when you get 3 stars.
- **Stars per level:** a level is 3 recipes, so the first finish adds up to 9 stars (36 total for 4 levels). Mini-games don't give stars.
- **"Start over" erases clothes too**, so nobody can reset, earn the stars again, and keep their clothes. It has its own confirmation box.
- **Saving:** stars and clothes are saved in the player's browser, so they're still there next time (until they start over).
- **Shop:** 14 items in 4 slots (hats, neck, aprons, extras), costing 3–14 stars. Everything together costs 86 stars, more than the 36 you can earn, so players have to choose.
- **Maze rules:** collect 8 named foods to win, with 3 hearts. A wrong food or a mouse costs a heart. The right food is always reachable without touching a wrong one (this was a real bug found in testing and fixed).
- **Chef messages** for 3 stars avoid saying "parfait", because a level can earn the happiest reaction without being perfect (found in testing).

### Play-test notes (fill in after the next play-test)
- Do players like the chef and the shop?
- Is the maze too easy or too hard? (Mice speed, 8 foods to win)
- Are the shop prices fair?

---

## Session 8: More challenge, all the words, and a new look

### Describe: my requests
1. Maze: mice that **chase** you, a **bigger map**, **traps** that cost a heart, and **5 hearts** instead of 3.
2. **5 stars** per level instead of 3.
3. **Use all the vocabulary** I gave, leaving nothing out.
4. Make the homepage, UI and game look **a lot better**: less blocky and single-colored, more vibrant and animated, like *Overcooked*.
5. A homepage button that shows **all the vocabulary**.
6. **Cheaper clothes** and more **unique** ones (e.g. a cheese hat, a jelly beard).
7. **Mini-games give 1 star** when completed.

### Design decisions the AI made (for me to review)
- **5 stars per recipe:** −1 per mistake (max −3), −1 for being slow, minimum 1. A level is 3 recipes, so it's worth up to 15 stars.
- **Mini-game stars:** 1 star the **first** time you complete each one (to match my "no farming" rule): serve 5 of 8 café customers, catch 10 falling foods, or win the maze.
- **All 124 words used:** new recipes (salade niçoise, gratin de légumes, buffet de viandes froides, compote de fruits…), more Dîner options (escargots, lapin à la moutarde, dinde rôtie, crème brûlée…), and a new **Level 5, "Le Restaurant"**, for meal words, menu words and verbs. A test fails if any word is ever left out.
- **Typing clues:** 17 words got a special English clue because the plain English would confuse or give the answer away. Examples: *le pruneau* = "a dried plum" (not "prune", which looks like *la prune* = plum); *le radis* = "a small, red, crunchy root vegetable" ("radish" contains the answer). **These clues are new text I should check.**
- **Maze:** 19 × 15 map, 5 hot-stove traps, 3 mice that follow the shortest path to the chef 75% of the time.
- **Clothes:** 21 items at 1–6 stars, including a beard slot. Because the star rules and clothes changed, saved progress starts fresh once.
- **New look:** chunky outlined cards, bold colors, a tiled kitchen floor, buttons that press down, an order ticket with a draining timer bar, plates on a wooden counter, a cooking pot, confetti for 5-star results, and the "Lilita One" and "Nunito" fonts. Animations switch off for players who ask for less motion.
- **Pronunciation:** the vocabulary page has 🔊 buttons that use the browser's French voice. Voices differ between computers.

### Problems found in testing (and fixed)
- The maze traps all appeared in one corner: their glow animation used the same CSS property that places them on the map.
- Word cards broke words in the middle ("petit-déjeune / r").
- "radish" gave away *radis* (caught by the new clue test).

### Play-test notes (fill in after the next play-test)
- Is the maze too hard now (3 chasing mice + traps)?
- Do players notice and like the new look?
- Check the new recipe names and the 17 typing clues.

---

## Session 9: Designing for memory (spaced repetition)

### Discern: the play-test question that started this
> "What's the logic behind the words, and how often do they appear? Do they reappear… How do we build on what we know about memory to help people revisit those things they've once learned, kind of like Membean or Duolingo?"

Honest answer before this session: words did **not** come back on purpose. Recipes were random, and the game didn't remember what a player knew.

### Describe: my requests
1. Absorb that feedback and design for it.
2. When replaying a level, words the player knows well should be **less likely**, and words they struggle with **more likely**. Keep each mode's focus area (fruits, etc.).
3. Every so often, when moving between screens (e.g. menu → shop, or one mode → another), a **random question** pops up: right = +1 ⭐, wrong or not done = −1 ⭐, never below 0.
4. At the end of each level, a **quiz on ALL its vocabulary**. Pass = +10 ⭐, fail = −5 ⭐. Infinite attempts, but stars only on the first try.

### Design decisions the AI made (for me to review)
- **Method:** spaced repetition with **Leitner boxes** (0–5), plus retrieval practice. The research and the reasons are written up in `LEARNING_DESIGN.md`.
- **Waiting times:** 2 min, 10 min, 1 h, 1 day, 3 days (short, for class sessions).
- **Weights:** struggling words 6, new 3, learning 4 or 2, mastered 1 or 0.5; due words count double.
- **A word counts as right only with no mistake on it** in that recipe.
- **Surprise questions:** only on menu screens (never in a timed game), 35% chance, at least 45 seconds apart, only about words already seen (due and weak first). "Skip" counts as not doing it (−1 ⭐).
- **Quizzes:** one per level (5 total), covering every word in all the level's recipes, so together they cover all 124 words. Multiple choice (4 options), pass at 80%. Leaving a first try early counts as finishing it, so nobody can peek and leave. Quizzes open once their level is finished. Mini-games don't have their own quiz; their words are all covered by the level quizzes.
- **Progress shown** on the vocabulary page (dots and labels, "À revoir" filter) and on the quiz cards.

### Questions to think about
- Is 80% the right pass mark? Is the surprise question too frequent or too rare?
- Would a short before-and-after test with classmates show whether they actually remember more?

---

## Session 10: Feedback from a French teacher

### Discern: what the teacher said
A French teacher play-tested the game. They said it's impressive and could be used in French 1–3 classes. Their points:
1. **Level 2 is wrong for words like *ananas* and *orange*.** The choices were le/la/les, so the game wanted "la orange" / "le ananas". In French it's *l'orange* and *l'ananas*.
2. **Audio:** it would help to hear Chef Barbe and the customers say the words.
3. They **loved the surprise question**.
4. Could there be a **sign-in or a way to save** progress?

### A mistake the AI made (and I approved)
In Milestone 3 the AI decided that for *l'* words the right answer would be the "hidden gender" (*l'orange* → **la**), and I accepted it. But nobody says "la orange". That taught the wrong French. A real French speaker caught it in one play-test. That's why a human has to check AI work, and why I asked a teacher.

**Lesson:** the AI also filled in the genders of the *l'* words (marked `verify` in `vocab.js`). I should ask my teacher to check those too.

### Decisions I made
- **Order:** 1. fix l', 2. audio (the browser's built-in French voice), 3. saving.
- **The l' fix:** Level 2 now has four buttons: **le, la, l', les**. Before a vowel the answer is *l'*. After a correct *l'*, the game still teaches the gender: "orange est féminin : une orange". If you pick wrong on a vowel word, it hints "it starts with a vowel". This also fixes *l'oignon* in the Level 4 entrée (*une soupe à l'oignon*).

### Problems found in testing (and fixed)
- A new test checked that no word starting with a vowel is answered with le or la. It flagged **yaourt**, but *le yaourt* is correct, because "y" acts like a consonant there. So the test was wrong, not the game. The "vowel" check now leaves out y. *Le hors d'œuvre* also keeps "le" (h aspiré).
