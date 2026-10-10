// ============================================================
// save.js — the "💾 Ma sauvegarde" screen.
//
// Progress lives in this browser on this computer (localStorage). To move it
// to another computer, the player copies a SAVE CODE and pastes it there.
// No accounts and no student data on a server: the code is just the
// player's progress written as text (see encodeSave/decodeSave in progress.js).
// Idea from a French teacher's play-test ("is there a sign-in or a way to save?").
// ============================================================

let pendingSave = null; // a loaded code waiting for "Oui, charger ce code"

function showSave() {
  document.getElementById("save-code-out").value = encodeSave(progress);
  document.getElementById("save-copy-message").textContent = "";
  document.getElementById("save-code-in").value = "";
  document.getElementById("save-load-message").textContent = "";
  document.getElementById("save-load-message").className = "feedback";
  document.getElementById("save-load-confirm").hidden = true;
  pendingSave = null;
  showScreen("save-screen");
}

// Copies the code. If the browser blocks the clipboard, the code is selected
// so the player can press Ctrl+C (or ⌘+C) themselves.
function copySaveCode() {
  const box = document.getElementById("save-code-out");
  const message = document.getElementById("save-copy-message");
  box.select();
  const copied = () => (message.textContent = "Code copié ! (Copied!)");
  const selectInstead = () => (message.textContent = "Le code est sélectionné : appuie sur Ctrl+C. (Press Ctrl+C to copy.)");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(box.value).then(copied, selectInstead);
  } else {
    selectInstead();
  }
}

// Step 1 of loading: check the code and show what's in it.
function checkSaveCode() {
  const message = document.getElementById("save-load-message");
  const result = decodeSave(document.getElementById("save-code-in").value);
  if (!result.ok) {
    message.textContent = result.reason;
    message.className = "feedback bad";
    document.getElementById("save-load-confirm").hidden = true;
    return;
  }
  pendingSave = result.progress;
  message.textContent = "";
  message.className = "feedback";
  document.getElementById("save-load-summary").textContent = "Ce code : " + saveSummary(pendingSave) + ".";
  document.getElementById("save-current-summary").textContent = saveSummary(progress);
  document.getElementById("save-load-confirm").hidden = false;
}

// Step 2: the player said yes.
function loadSaveCode() {
  if (!pendingSave) return;
  replaceProgress(pendingSave);
  pendingSave = null;
  renderChefs(); // the chef's clothes and the star counts
  document.getElementById("save-load-confirm").hidden = true;
  document.getElementById("save-code-in").value = "";
  document.getElementById("save-code-out").value = encodeSave(progress);
  const message = document.getElementById("save-load-message");
  message.textContent = "C'est chargé ! Bon retour en cuisine ! (Loaded! Welcome back!)";
  message.className = "feedback good";
  playSound("done");
}

// ---------- Buttons ----------

for (const button of document.querySelectorAll(".open-save-button")) {
  button.addEventListener("click", showSave);
}
document.getElementById("save-copy-button").addEventListener("click", copySaveCode);
document.getElementById("save-load-button").addEventListener("click", checkSaveCode);
document.getElementById("save-load-yes").addEventListener("click", loadSaveCode);
document.getElementById("save-load-cancel").addEventListener("click", () => {
  pendingSave = null;
  document.getElementById("save-load-confirm").hidden = true;
});
document.getElementById("save-back-button").addEventListener("click", () => showScreen("title-screen"));
document.getElementById("save-levels-button").addEventListener("click", showLevels);
