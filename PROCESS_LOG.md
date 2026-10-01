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

**Mistakes I caught in the AI's work:** *(add any here)*

### Diligence
- The README credits AI help and the vocab source.
- Automated tests (`tests/vocab.test.js`) catch data mistakes like duplicate ids, articles that don't match gender, or two words with the same emoji.
- Nothing ships until I've checked every word in `vocab-check.html`.
