// ============================================================
// check.js — decides if a typed or chosen answer is right.
//
// checkTyped(input, word) returns one of:
//   "correct"  exactly right (capitals, extra spaces and ’ vs ' don't matter)
//   "accent"   right except for accents → counts, but we show the accents
//   "article"  the word is right but the typed article is wrong → counts, but we show it
//   "wrong"    not the word
//
// Typing the article is optional: "pomme" and "la pomme" are both fine.
// "oe" is accepted for "œ" because œ is hard to type on most keyboards.
// ============================================================

// Lowercase, trim, one space between words, one kind of apostrophe, oe instead of œ.
function normalize(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[’‘`]/g, "'")
    .replace(/œ/g, "oe");
}

// Removes accents: "pêche" → "peche". Also treats a hyphen like a space.
function removeAccents(text) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/-/g, " ");
}

// Splits "la pomme" into { article: "la", noun: "pomme" }. No article → article is null.
function splitArticle(text) {
  const elided = text.match(/^l'\s*(.+)$/);
  if (elided) return { article: "l'", noun: elided[1] };
  const spaced = text.match(/^(le|la|les|un|une|des) (.+)$/);
  if (spaced) return { article: spaced[1], noun: spaced[2] };
  return { article: null, noun: text };
}

function checkTyped(input, word) {
  const typed = splitArticle(normalize(input));
  const answer = normalize(word.fr);

  let result;
  if (typed.noun === answer) result = "correct";
  else if (removeAccents(typed.noun) === removeAccents(answer)) result = "accent";
  else return "wrong";

  // The noun is right. If they typed an article, check it too.
  if (typed.article && word.article && typed.article !== word.article) return "article";
  return result;
}

// The article to pick in the article level: le, la, l' or les.
// Before a vowel, French uses l' (l'orange, l'ananas, l'oignon), never le/la.
// "un œuf" becomes "l'œuf" for the same reason.
// (Thanks to a French teacher's play-test for catching that the first
// version wrongly asked for "la orange".)
// "y" is left out on purpose: it's "le yaourt", not "l'yaourt".
function startsWithVowel(text) {
  return /^[aeiouàâäéèêëîïôöùûüœæ]/i.test(text);
}

function definiteArticle(word) {
  if (word.plural) return "les";
  if (word.article === "le" || word.article === "la" || word.article === "l'") return word.article;
  if (startsWithVowel(word.fr)) return "l'";
  return word.gender === "m" ? "le" : "la";
}

// For words with l', the gender is hidden, so the game explains it:
// "orange est féminin : une orange".
function hiddenGenderTip(word) {
  if (definiteArticle(word) !== "l'") return "";
  return word.gender === "m"
    ? word.fr + " est masculin : un " + word.fr
    : word.fr + " est féminin : une " + word.fr;
}

if (typeof module !== "undefined") {
  module.exports = { normalize, removeAccents, splitArticle, checkTyped, startsWithVowel, definiteArticle, hiddenGenderTip };
}
