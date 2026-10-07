# How *La Cuisine* Helps Words Stick

A play-tester asked:

> "What's the logic behind the words, and how often do they appear? Do they reappear, and what's the method behind making sure people learn those key terms? Are they revisited, or do they just see them once and then in the mini-game again? How do we build on what we know about memory to help people revisit things they've once learned, like Membean or Duolingo?"

This document answers that question. It explains the learning science the game is built on and exactly how each idea shows up in the game.

## What we know about memory

| Idea | What the research says | Where it comes from |
|---|---|---|
| **The forgetting curve** | Most of what we learn fades quickly unless we review it, and each review slows the forgetting. | Hermann Ebbinghaus, *Über das Gedächtnis* (1885) |
| **Spaced repetition** | Reviews spread out over time beat the same amount of practice crammed together. The best gap grows as a memory gets stronger. | Cepeda et al., "Distributed practice in verbal recall tasks," *Psychological Bulletin* (2006) |
| **Leitner boxes** | A simple way to do spaced repetition with flashcards: cards you know move to boxes you review less often; cards you miss go back to the first box. | Sebastian Leitner, *So lernt man lernen* (1972) |
| **Retrieval practice (the testing effect)** | Trying to *recall* an answer strengthens memory more than reading it again, even when you get it wrong and then see the answer. | Roediger & Karpicke, "Test-enhanced learning," *Psychological Science* (2006) |
| **Feedback** | Seeing the right answer straight after a mistake helps fix the error. | (common finding across the same research) |

Apps like Duolingo and Membean combine these ideas: they track each word, bring back the ones you're about to forget, and make you *recall* them rather than just see them.

## How the game uses these ideas

### 1. Every word has a memory (Leitner boxes) — `js/memory.js`
The game keeps a record for each of the 124 words, saved in the player's browser:

| Box | Meaning | Label on the vocabulary page | Comes back after |
|---|---|---|---|
| 0 | never seen | ✨ nouveau | — |
| 1 | missed last time | 🔁 à revoir | 2 minutes |
| 2 | learning | 📈 en progrès | 10 minutes |
| 3 | learning | 📈 en progrès | 1 hour |
| 4 | known | 🏆 maîtrisé | 1 day |
| 5 | well known | 🏆 maîtrisé | 3 days |

- A **right answer** moves the word **up** a box, so it waits longer before coming back.
- A **wrong answer** sends it back to **box 1**, so it comes back soon.
- In a recipe, a word only counts as right if you got it with **no mistake** on it.
- **Every** answer counts: levels, mini-games, surprise questions and quizzes.

When a word's waiting time is over, it is **due**: the player is about to forget it, which is the best moment to review it.

### 2. Weak words come back more often (weighted choice)
Each word gets a weight from its box. **Struggling** words weigh the most, then new words, then words still being learned; **mastered** words weigh the least (but never zero, so they still come back now and then). **Due** words count double.

- **Replaying a level:** each level still has its own theme (fruits, the article level, typing, the menu…), but the game picks the 3 recipes whose words *need practice most*. A recipe full of words you struggle with is much more likely than one full of words you've mastered. (Tested: a struggling recipe is picked over 90% of the time, compared with 60% by chance.)
- **Mini-games:** the café orders, the falling-food targets and the maze targets are chosen the same way.

### 3. Surprise review questions (spaced retrieval) — `js/quiz.js`
Sometimes, when the player arrives at a menu screen (main menu, level select, shop, vocabulary page), a **"Question surprise !"** pops up:
- It only asks about words the player has **already seen**. **Due** words come first, and the weakest are most likely.
- It mixes both directions: *French → English* and *picture/English → French*.
- Right: **+1 ⭐**. Wrong or skipped: **−1 ⭐** (never below 0). The right answer is always shown.
- It never interrupts a timed game, and there are at least 45 seconds between two questions (35% chance per menu visit), so it doesn't nag.

This is the "revisit what you once learned" part: words come back *between* games, at spaced moments, and the player has to recall them.

### 4. A quiz on every word of the level (retrieval practice)
After finishing a level, its quiz asks about **every word in all of the level's recipes**, not just the 3 recipes played. The 5 quizzes together cover **all 124 words** (a test checks this).
- Multiple choice with 4 options. Wrong options come from the same category, so the player has to really know the word.
- Pass mark: 80%. **First try only:** pass = **+10 ⭐**, fail = **−5 ⭐**. Retries are unlimited and free, and the best score is kept.
- Every quiz answer updates the word's box, and missed words are listed as "les mots à revoir".

### 5. Players can see their progress
The **📖 Tout le vocabulaire** page shows every word's box as dots (●●○○○), its label, and a summary ("🏆 12 maîtrisés · 📈 30 en progrès · 🔁 5 à revoir · ✨ 77 nouveaux"). The **🔁 À revoir** filter lists exactly the words that need work. The quiz cards on the level select screen show "X maîtrisés" for each level.

## So, do words reappear?

Yes, and on purpose:

1. **Inside a level:** a missed word goes on the review list and can be practiced right away ("Pratiquer ces mots").
2. **On replay:** recipes with weak words are picked more often.
3. **Between games:** surprise questions bring back words that are due.
4. **At the end of a level:** the quiz covers every word in the level.
5. **Across the game:** the mini-games pick their targets the same way.

A word stops coming back often only after the player has got it right several times in a row, with growing gaps in between. That's the definition of learning it.

## Limits (honest notes)

- The waiting times (2 min → 3 days) are shorter than in flashcard apps because a class plays in short sessions. They are one line in `js/memory.js` (`BOX_WAIT_MINUTES`) and easy to change.
- Progress is saved in one browser. A classmate on another computer starts fresh.
- Multiple choice is easier than typing a word from memory; the typing levels (3, 4 and 5) give harder recall practice.
- We haven't measured whether players actually remember more. A next step would be a short test before and after playing.
