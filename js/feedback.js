// ============================================================
// feedback.js — the play-test feedback form ("Donner mon avis").
//
// In the ONLINE version (the claude.ai link), answers are saved to the
// page's database: each player gets one private entry, feedback/<their id>
// (sending again updates it, so nobody is counted twice). Only the owner
// (the student who made the game) can read them, with "Voir les avis".
// If saving isn't possible (the downloaded file, or a viewer who isn't
// allowed to save), the form shows the answers as text to copy and send.
// Answers are anonymous: no names are stored.
// ============================================================

const feedback = {
  db: null,          // the database, or null if this view can't use one
  userId: null,      // this player's id (needed to save their entry)
  canSave: false,
  isOwner: false,
  unsubscribe: null, // stops the live list of answers for the owner
};

// Connect to the database if this page is running online on claude.ai.
async function setupFeedback() {
  if (!window.claude || !window.claude.use) return; // downloaded file: no database
  try {
    feedback.db = await window.claude.use("db");
    const user = await window.claude.use("user");
    feedback.isOwner = user ? await user.isOwner() : false;
    feedback.userId = user ? await user.id() : null;
    const canWrite = user ? await user.can("data.write") : null;
    // null means "not told": try to save and fall back if it fails.
    feedback.canSave = !!feedback.db && !!feedback.userId && canWrite !== false;
  } catch (error) {
    feedback.db = null;
  }
  document.getElementById("see-feedback-button").hidden = !(feedback.db && feedback.isOwner);
}

function openFeedback() {
  document.getElementById("feedback-form").reset();
  document.getElementById("feedback-form").hidden = false;
  document.getElementById("feedback-thanks").hidden = true;
  document.getElementById("feedback-copy").hidden = true;
  document.getElementById("feedback-error").textContent = "";
  document.getElementById("feedback-offline-note").hidden = feedback.canSave;
  showScreen("feedback-screen");
}

// Reads the form into one object.
function readFeedbackForm() {
  const form = document.getElementById("feedback-form");
  const data = new FormData(form);
  return {
    fun: Number(data.get("fun")) || null,
    learned: Number(data.get("learned")) || null,
    favorite: data.get("favorite") || "",
    frenchLevel: data.get("frenchLevel") || "",
    confusing: (data.get("confusing") || "").trim().slice(0, 1000),
    ideas: (data.get("ideas") || "").trim().slice(0, 1000),
    // What they played, so the answers can be compared with how far they got.
    levelsFinished: Object.keys(progress.completed),
    gamesPlayed: Object.keys(state.bestModes),
    sentAt: new Date().toISOString(),
  };
}

async function submitFeedback(event) {
  event.preventDefault();
  const answers = readFeedbackForm();
  if (!answers.fun || !answers.learned) {
    document.getElementById("feedback-error").textContent =
      "Choisis une note pour les deux premières questions. (Please rate the first two questions.)";
    return;
  }
  document.getElementById("feedback-error").textContent = "";

  const button = document.getElementById("feedback-send");
  button.disabled = true;
  if (feedback.canSave) {
    try {
      await feedback.db.doc("feedback/" + feedback.userId).set(answers);
      document.getElementById("feedback-form").hidden = true;
      document.getElementById("feedback-thanks").hidden = false;
      button.disabled = false;
      return;
    } catch (error) {
      feedback.canSave = false; // not allowed to save in this view: use the copy box instead
    }
  }
  button.disabled = false;
  showCopyBox(answers);
}

// When saving isn't possible: show the answers as text to copy and send.
function showCopyBox(answers) {
  const text =
    "La Cuisine feedback\n" +
    "Fun (1-5): " + answers.fun + "\n" +
    "Learned words (1-5): " + answers.learned + "\n" +
    "Favorite part: " + (answers.favorite || "-") + "\n" +
    "French level: " + (answers.frenchLevel || "-") + "\n" +
    "Confusing: " + (answers.confusing || "-") + "\n" +
    "Ideas: " + (answers.ideas || "-");
  document.getElementById("feedback-copy-text").value = text;
  document.getElementById("feedback-copy").hidden = false;
}

async function copyFeedbackText() {
  const box = document.getElementById("feedback-copy-text");
  try {
    await navigator.clipboard.writeText(box.value);
    document.getElementById("feedback-copy-button").textContent = "Copié ! (Copied)";
  } catch (error) {
    box.select(); // copying was blocked: select the text so it can be copied by hand
  }
}

// ---------- Owner only: read everyone's answers ----------

function openFeedbackResults() {
  showScreen("feedback-results-screen");
  if (feedback.unsubscribe) return; // already listening
  feedback.unsubscribe = feedback.db
    .collection("feedback")
    .orderBy("sentAt", "desc")
    .onSnapshot(
      (snapshot) => drawFeedbackResults(snapshot.docs.map((doc) => doc.data())),
      () => {
        document.getElementById("feedback-summary").textContent =
          "Les avis ne peuvent pas être chargés. (Feedback could not be loaded.)";
      }
    );
}

function average(numbers) {
  const valid = numbers.filter((n) => typeof n === "number");
  if (valid.length === 0) return "-";
  return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1);
}

function drawFeedbackResults(all) {
  document.getElementById("feedback-summary").textContent =
    all.length === 0
      ? "Pas encore d'avis. Partage le lien du jeu avec tes camarades ! (No feedback yet.)"
      : all.length + " avis · Amusant : " + average(all.map((a) => a.fun)) + " / 5 · Appris : " +
        average(all.map((a) => a.learned)) + " / 5";

  const rows = document.getElementById("feedback-rows");
  rows.innerHTML = "";
  for (const a of all) {
    addRow(rows, [
      (a.sentAt || "").slice(0, 10),
      a.fun + " / " + a.learned,
      a.favorite || "-",
      a.frenchLevel || "-",
      a.confusing || "-",
      a.ideas || "-",
    ]);
  }
}

// ---------- Buttons ----------

for (const button of document.querySelectorAll(".open-feedback-button")) {
  button.addEventListener("click", openFeedback);
}
document.getElementById("feedback-form").addEventListener("submit", submitFeedback);
document.getElementById("feedback-copy-button").addEventListener("click", copyFeedbackText);
document.getElementById("feedback-back-button").addEventListener("click", () => showScreen("title-screen"));
document.getElementById("see-feedback-button").addEventListener("click", openFeedbackResults);
document.getElementById("feedback-results-back").addEventListener("click", () => showScreen("title-screen"));

setupFeedback();
