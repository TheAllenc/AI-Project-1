// ============================================================
// quiz.js — practice that makes words stick (retrieval practice).
//
// 1. LEVEL QUIZZES: after finishing a level, a quiz on EVERY word the level
//    uses (all its recipes, not just the 3 you cooked). Pass = 80%.
//    First try only: pass = +10 stars, fail = -5 stars. Retry as often as you like.
// 2. SURPRISE QUESTIONS ("Question surprise !"): sometimes, when you arrive
//    at a menu screen, one quick question pops up about a word you've seen,
//    picked by spaced repetition (words that are due or weak come first).
//    Right = +1 star; wrong or skipped = -1 star (never below 0).
//
// Every answer here also updates the word's memory (memory.js).
// Uses: VOCAB/withArticle/getWord (vocab.js), levelWords (recipes.js),
// memory.js, progress.js, speakFrench/voice (voice.js), and showScreen/shuffle/addRow/celebrate (game.js).
// ============================================================

const QUIZ_CHOICES = 4;

// ---------- Building questions (pure: no screen code, so the tests can check them) ----------

// The text a word shows as a clue: its picture, or its English (or special clue).
function clueText(word) {
  return word.emoji || "“" + (word.clue || word.en) + "”";
}

// One multiple-choice question about a word.
//   kind "fr-en":  see the French word, pick its meaning in English.
//   kind "en-fr":  see the picture or English clue, pick the French word.
//   kind "listen": HEAR the French word (nothing written), pick its meaning in English.
// "speak" is what the voice reads when the question appears ("" = nothing,
// because reading it would give the answer away).
// Wrong answers come from the same category when possible (harder to guess),
// and never mean the same thing or look the same as the right answer.
function buildQuestion(word, kind, random = Math.random) {
  const answerOf = (w) => (kind === "en-fr" ? withArticle(w) : w.en);
  const looksSame = (w) =>
    w.id === word.id || w.fr === word.fr || w.en === word.en || answerOf(w) === answerOf(word) ||
    (word.emoji && w.emoji === word.emoji);
  const others = VOCAB.filter((w) => !looksSame(w));
  const sameCategory = others.filter((w) => w.categories.some((c) => word.categories.includes(c)));
  const rest = others.filter((w) => !sameCategory.includes(w));

  const wrong = [];
  for (const w of [...shuffleWith(sameCategory, random), ...shuffleWith(rest, random)]) {
    if (wrong.length === QUIZ_CHOICES - 1) break;
    if (!wrong.some((x) => answerOf(x) === answerOf(w))) wrong.push(w);
  }
  const options = shuffleWith([word, ...wrong], random).map(answerOf);
  return {
    wordId: word.id,
    kind,
    prompt: kind === "fr-en" ? withArticle(word) : kind === "listen" ? "🔊" : clueText(word),
    isPicture: kind !== "fr-en" && Boolean(word.emoji || kind === "listen"),
    speak: kind === "en-fr" ? "" : withArticle(word),
    options,
    answerIndex: options.indexOf(answerOf(word)),
  };
}

const BASIC_KINDS = ["fr-en", "en-fr"];

// A quiz on every word of a level, in random order, mixing the kinds of question.
function buildLevelQuiz(level, random = Math.random, kinds = BASIC_KINDS) {
  return shuffleWith(levelWords(level), random).map((id) =>
    buildQuestion(getWord(id), kinds[Math.floor(random() * kinds.length)], random)
  );
}

// Listening questions only when the browser can speak and the voice is on.
function questionKinds() {
  return canSpeak() && voice.on ? [...BASIC_KINDS, "listen"] : BASIC_KINDS;
}

// ---------- The level quiz screen ----------

const quiz = {
  level: null,
  questions: [],
  index: 0,
  score: 0,
  missed: [],
  answered: false,
  first: true, // is this the player's first try at this quiz?
};

function startQuiz(level) {
  quiz.level = level;
  quiz.questions = buildLevelQuiz(level, Math.random, questionKinds());
  quiz.index = 0;
  quiz.score = 0;
  quiz.missed = [];
  quiz.first = progress.quizzes[level.id] === undefined;
  document.getElementById("quiz-title").textContent = "Quiz : " + level.name;
  document.getElementById("quiz-note").textContent = quiz.first
    ? "Premier essai ! 80% pour réussir : +10 ⭐ si tu réussis, −5 ⭐ sinon. (First try: pass with 80% for +10 stars, or lose 5.)"
    : "Entraînement : pas d'étoiles en jeu, seulement ton meilleur score. (Practice: no stars at stake.)";
  document.getElementById("quiz-quit-confirm").hidden = true;
  showScreen("quiz-screen");
  showQuizQuestion();
}

function showQuizQuestion() {
  const q = quiz.questions[quiz.index];
  const total = quiz.questions.length;
  quiz.answered = false;
  document.getElementById("quiz-count").textContent = quiz.index + 1 + " / " + total;
  document.getElementById("quiz-bar-fill").style.width = (quiz.index / total) * 100 + "%";
  drawQuestion(q, document.getElementById("quiz-question"), answerQuiz);
  document.getElementById("quiz-feedback").className = "feedback";
  document.getElementById("quiz-feedback").textContent = "";
  document.getElementById("quiz-next").hidden = true;
}

// Draws a question (used by the quiz and by the surprise pop-up).
function drawQuestion(q, box, onAnswer) {
  box.innerHTML = "";
  const ask = document.createElement("p");
  ask.className = "quiz-ask";
  ask.textContent = {
    "fr-en": "Qu'est-ce que ça veut dire ? (What does it mean?)",
    "en-fr": "Comment dit-on en français ? (How do you say it in French?)",
    listen: "Écoute ! Qu'est-ce que ça veut dire ? (Listen! What does it mean?)",
  }[q.kind];
  const prompt = document.createElement(q.kind === "listen" ? "button" : "div");
  prompt.className = q.isPicture ? "quiz-prompt picture" : "quiz-prompt";
  prompt.textContent = q.prompt;
  if (q.kind === "listen") {
    // The big 🔊 replays the word; the small 🐢 says it slowly.
    prompt.type = "button";
    prompt.classList.add("listen-button");
    prompt.setAttribute("aria-label", "Réécouter (listen again)");
    prompt.addEventListener("click", () => speakFrench(q.speak, { force: true }));
  }
  const grid = document.createElement("div");
  grid.className = "quiz-options";
  q.options.forEach((text, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option";
    button.textContent = text;
    button.addEventListener("click", () => onAnswer(i, grid));
    grid.appendChild(button);
  });
  box.append(ask, prompt, grid);
  if (q.speak) {
    const slow = document.createElement("button");
    slow.type = "button";
    slow.className = "replay-slow-button";
    slow.textContent = "🐢";
    slow.title = "Plus lentement (slower)";
    slow.addEventListener("click", () => speakFrench(q.speak, { force: true, slow: true }));
    prompt.after(slow);
  }
  speakFrench(q.speak);
  if (!q.speak) forgetVoice();
  grid.firstChild.focus({ preventScroll: true });
}

// Colors the buttons: the right answer green, a wrong pick red.
function markOptions(grid, picked, answerIndex) {
  [...grid.children].forEach((button, i) => {
    button.disabled = true;
    if (i === answerIndex) button.classList.add("right");
    else if (i === picked) button.classList.add("wrong");
  });
}

function answerQuiz(picked, grid) {
  if (quiz.answered) return;
  quiz.answered = true;
  const q = quiz.questions[quiz.index];
  const correct = picked === q.answerIndex;
  markOptions(grid, picked, q.answerIndex);
  remember(q.wordId, correct);
  const word = getWord(q.wordId);
  const box = document.getElementById("quiz-feedback");
  speakFrench(withArticle(word)); // hear the answer either way
  if (correct) {
    quiz.score++;
    playSound("good");
    box.textContent = "Oui ! " + withArticle(word) + " = " + word.en;
    box.className = "feedback good";
  } else {
    quiz.missed.push(q.wordId);
    playSound("bad");
    box.textContent = "Non : " + withArticle(word) + " = " + word.en;
    box.className = "feedback bad";
  }
  const next = document.getElementById("quiz-next");
  next.textContent = quiz.index === quiz.questions.length - 1 ? "Voir mon résultat →" : "Question suivante →";
  next.hidden = false;
  next.focus({ preventScroll: true });
}

function nextQuizQuestion() {
  if (quiz.index < quiz.questions.length - 1) {
    quiz.index++;
    showQuizQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  const total = quiz.questions.length;
  const result = recordQuiz(progress, quiz.level.id, quiz.score, total);
  saveProgress();
  renderChefs();

  document.getElementById("quiz-result-title").textContent =
    (result.passed ? "Quiz réussi ! 🎉 " : "Pas encore… ") + quiz.level.name;
  document.getElementById("quiz-result-score").textContent =
    quiz.score + " / " + total + " (" + Math.round((quiz.score / total) * 100) + "%)";
  let starText;
  if (!result.first) starText = "Entraînement : pas d'étoiles en jeu. Meilleur score : " + progress.quizzes[quiz.level.id].best + " / " + total + ".";
  else if (result.starChange > 0) starText = "⭐ +" + result.starChange + " étoiles ! (first try, passed)";
  else if (result.starChange < 0) starText = "⭐ " + result.starChange + " étoiles. Réessaie quand tu veux ! (first try, not passed)";
  else starText = "Pas d'étoiles à perdre. Réessaie quand tu veux !";
  document.getElementById("quiz-result-stars").textContent = starText;
  showChefReaction("quiz-result", result.passed ? 3 : quiz.score / total >= 0.5 ? 2 : 1);

  const rows = document.getElementById("quiz-result-missed");
  rows.innerHTML = "";
  for (const id of quiz.missed) {
    const word = getWord(id);
    addRow(rows, [word.emoji || "", withArticle(word), word.en]);
    rows.lastChild.firstChild.className = "emoji";
  }
  document.getElementById("quiz-missed-section").hidden = quiz.missed.length === 0;
  showScreen("quiz-result-screen");
  if (result.passed) celebrate();
}

// Leaving a FIRST try counts as finishing it (so nobody can peek at the
// questions and leave to avoid losing stars). Practice tries can be left freely.
function quitQuiz() {
  if (quiz.first) {
    document.getElementById("quiz-quit-confirm").hidden = false;
  } else {
    showLevels();
  }
}

// ---------- Surprise review questions ----------

const SURPRISE_CHANCE = 0.35;        // chance of a question when arriving at a menu screen
const SURPRISE_COOLDOWN_MS = 45000;  // at least 45 seconds between two questions
const SURPRISE_SCREENS = ["title-screen", "levels-screen", "shop-screen", "vocab-screen"];

const surprise = { question: null, lastTime: 0, open: false, answered: false };

// Called by showScreen() every time the screen changes.
function maybeSurprise(fromId, toId, random = Math.random) {
  if (surprise.open || !fromId || fromId === toId) return;
  if (!SURPRISE_SCREENS.includes(toId)) return; // never in the middle of a game
  if (Date.now() - surprise.lastTime < SURPRISE_COOLDOWN_MS) return;
  if (random() >= SURPRISE_CHANCE) return;
  const id = chooseReviewWord(progress.memory, VOCAB.map((w) => w.id));
  if (!id) return; // not enough words seen yet
  openSurprise(getWord(id));
}

function openSurprise(word) {
  const kinds = questionKinds();
  surprise.question = buildQuestion(word, kinds[Math.floor(Math.random() * kinds.length)]);
  surprise.open = true;
  surprise.answered = false;
  surprise.lastTime = Date.now();
  document.getElementById("surprise-feedback").className = "feedback";
  document.getElementById("surprise-feedback").textContent = "";
  document.getElementById("surprise-skip").hidden = false;
  document.getElementById("surprise-continue").hidden = true;
  document.getElementById("surprise-popup").hidden = false;
  drawQuestion(surprise.question, document.getElementById("surprise-question"), answerSurprise);
}

function answerSurprise(picked, grid) {
  if (surprise.answered) return;
  const q = surprise.question;
  const correct = picked === q.answerIndex;
  markOptions(grid, picked, q.answerIndex);
  finishSurprise(correct, correct ? "Bravo ! " : "Non… ");
}

function skipSurprise() {
  if (surprise.answered) return;
  finishSurprise(false, "Passé. ");
}

function finishSurprise(correct, start) {
  surprise.answered = true;
  const word = getWord(surprise.question.wordId);
  remember(word.id, correct);
  const change = changeStars(progress, correct ? REVIEW_STARS : -REVIEW_STARS);
  saveProgress();
  renderChefs();
  playSound(correct ? "good" : "bad");
  speakFrench(withArticle(word), { queue: true });
  const starNote = change > 0 ? " (+1 ⭐)" : change < 0 ? " (−1 ⭐)" : " (0 ⭐)";
  const box = document.getElementById("surprise-feedback");
  box.textContent = start + withArticle(word) + " = " + word.en + starNote;
  box.className = "feedback " + (correct ? "good" : "bad");
  document.getElementById("surprise-skip").hidden = true;
  const next = document.getElementById("surprise-continue");
  next.hidden = false;
  next.focus({ preventScroll: true });
}

function closeSurprise() {
  surprise.open = false;
  document.getElementById("surprise-popup").hidden = true;
}

// ---------- Buttons ----------

if (typeof document !== "undefined") {
  document.getElementById("quiz-next").addEventListener("click", nextQuizQuestion);
  document.getElementById("quiz-quit").addEventListener("click", quitQuiz);
  document.getElementById("quiz-quit-yes").addEventListener("click", finishQuiz);
  document.getElementById("quiz-quit-no").addEventListener("click", () => {
    document.getElementById("quiz-quit-confirm").hidden = true;
  });
  document.getElementById("quiz-retry").addEventListener("click", () => startQuiz(quiz.level));
  document.getElementById("quiz-levels").addEventListener("click", showLevels);
  document.getElementById("report-quiz-button").addEventListener("click", () => startQuiz(state.level));
  document.getElementById("surprise-skip").addEventListener("click", skipSurprise);
  document.getElementById("surprise-continue").addEventListener("click", closeSurprise);
}

if (typeof module !== "undefined") {
  module.exports = { QUIZ_CHOICES, BASIC_KINDS, clueText, buildQuestion, buildLevelQuiz, SURPRISE_CHANCE, SURPRISE_COOLDOWN_MS };
}
