// ============================================================
// wordlist.js — "Tout le vocabulaire": every word in the game.
//
// Shows all of VOCAB (vocab.js) as cards, with a search box, category
// buttons, and a 🔊 button that reads the word aloud with the browser's
// built-in French voice (if the browser has one).
// Uses withArticle (vocab.js), removeAccents (check.js), showScreen (game.js).
// ============================================================

const wordList = {
  category: "all", // "all" or a key of CATEGORY_NAMES
  query: "",
};

// A color for each category (used when a word has no picture).
const CATEGORY_COLORS = {
  meals: "#ff5a3c", verbs: "#a86b33", fruits: "#ff7eb6", vegetables: "#3fbf55",
  dairy: "#5ab8ff", meat: "#d93d22", dessert: "#8e5cf7", other: "#1fb5a8",
};

function showWordList() {
  drawChips();
  drawWordList();
  showScreen("vocab-screen");
}

// The category buttons: "Tous" plus one per category.
function drawChips() {
  const row = document.getElementById("word-chips");
  row.innerHTML = "";
  const choices = [["all", "Tous (all)"], ...Object.entries(CATEGORY_NAMES)];
  for (const [key, name] of choices) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip" + (wordList.category === key ? " active" : "");
    chip.textContent = name;
    chip.setAttribute("aria-pressed", wordList.category === key);
    chip.addEventListener("click", () => {
      wordList.category = key;
      drawChips();
      drawWordList();
    });
    row.appendChild(chip);
  }
}

// Does a word match the search box? Accents and capitals don't matter.
function matchesSearch(word, query) {
  if (!query) return true;
  const simple = (text) => removeAccents(text.toLowerCase());
  return simple(withArticle(word)).includes(simple(query)) || simple(word.en).includes(simple(query));
}

function genderLabel(word) {
  if (!word.gender) return ["verbe (verb)", "verb"];
  if (word.plural) return [word.gender === "m" ? "masc. pl." : "fém. pl.", "pl"];
  return word.gender === "m" ? ["masculin", "m"] : ["féminin", "f"];
}

function drawWordList() {
  const words = VOCAB.filter((w) =>
    (wordList.category === "all" || w.categories.includes(wordList.category)) &&
    matchesSearch(w, wordList.query)
  );
  document.getElementById("word-count").textContent = VOCAB.length;
  document.getElementById("word-empty").hidden = words.length > 0;

  const grid = document.getElementById("word-grid");
  grid.innerHTML = "";
  for (const word of words) {
    const card = document.createElement("div");
    card.className = "word-card";

    // The picture, or the first letter in the category's color.
    const pic = document.createElement("span");
    pic.className = word.emoji ? "word-pic" : "word-pic letter";
    pic.textContent = word.emoji || word.fr.charAt(0).toUpperCase();
    pic.style.setProperty("--c", CATEGORY_COLORS[word.categories[0]]);

    const text = document.createElement("span");
    text.className = "word-text";
    const fr = document.createElement("span");
    fr.className = "word-fr";
    fr.textContent = withArticle(word);
    const en = document.createElement("span");
    en.className = "word-en";
    en.textContent = word.en;
    const [label, kind] = genderLabel(word);
    const pill = document.createElement("span");
    pill.className = "gender-pill " + kind;
    pill.textContent = label;
    text.append(fr, en, pill);

    card.append(pic, text);
    if ("speechSynthesis" in window) {
      const say = document.createElement("button");
      say.type = "button";
      say.className = "say-button";
      say.textContent = "🔊";
      say.setAttribute("aria-label", "Écouter : " + withArticle(word));
      say.addEventListener("click", () => speakFrench(withArticle(word)));
      card.appendChild(say);
    }
    grid.appendChild(card);
  }
}

// Reads French text aloud with the browser's French voice.
function speakFrench(text) {
  try {
    const speech = new SpeechSynthesisUtterance(text.replace("’", "'"));
    speech.lang = "fr-FR";
    speech.rate = 0.9;
    speechSynthesis.cancel(); // stop any word still being read
    speechSynthesis.speak(speech);
  } catch (error) {
    // No voice available: the card still shows the word.
  }
}

// ---------- Buttons ----------

document.getElementById("word-search").addEventListener("input", (event) => {
  wordList.query = event.target.value.trim();
  drawWordList();
});
for (const button of document.querySelectorAll(".open-vocab-button")) {
  button.addEventListener("click", showWordList);
}
document.getElementById("vocab-back-button").addEventListener("click", () => showScreen("title-screen"));
