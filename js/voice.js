// ============================================================
// voice.js — the game speaks French, using the browser's built-in voice
// (speechSynthesis). No sound files and no internet needed.
//
//   speakFrench(text)      reads French aloud (if the voice is on)
//   speakFrench(text, { force: true })  reads it even if the voice is off
//                          (for 🔊 buttons the player clicks on purpose)
//   speakFrench(text, { queue: true })  waits for the current sentence to end
//                          (so "Oui ! l'orange" isn't cut off by the next word)
//   replayVoice(slow)      says the last thing again (🐢 = slower)
//   frenchPart(message)    "Bravo ! (Well done!)" → "Bravo !"  (we never read the English)
//   canSpeak()             true if this browser can speak
//
// The 🗣️ button turns the voice on and off. The choice is remembered.
// Idea from a French teacher's play-test: "hear Chef Barbe and the customers say the words".
// ============================================================

const VOICE_RATE = 0.9;       // a little slower than normal speech
const VOICE_SLOW_RATE = 0.6;  // the 🐢 button
const VOICE_SETTING_KEY = "la-cuisine-voice";

const voice = {
  on: true,
  last: "", // the last French text spoken, for the replay buttons
};

// Removes the English in brackets: the chef's lines are "French (English)".
function frenchPart(message) {
  return message.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
}

function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// The best French voice the computer has: France French first, then any French.
// (Voices load a moment after the page, so we look them up each time.)
function frenchVoice() {
  const voices = speechSynthesis.getVoices();
  return voices.find((v) => v.lang === "fr-FR") || voices.find((v) => v.lang.startsWith("fr")) || null;
}

function speakFrench(text, options = {}) {
  if (!canSpeak() || !text) return;
  voice.last = text;
  if (!voice.on && !options.force) return;
  try {
    // "l’orange": the curly apostrophe can confuse some voices
    const speech = new SpeechSynthesisUtterance(text.replace(/’/g, "'"));
    speech.lang = "fr-FR";
    const french = frenchVoice();
    if (french) speech.voice = french;
    speech.rate = options.slow ? VOICE_SLOW_RATE : VOICE_RATE;
    if (!options.queue) speechSynthesis.cancel(); // stop anything still being read
    speechSynthesis.speak(speech);
  } catch (error) {
    // No voice available: everything is still written on screen.
  }
}

// Forget the last sentence (e.g. before a typing question, so 🔁 can't give the answer away).
function forgetVoice() {
  voice.last = "";
}

function replayVoice(slow) {
  speakFrench(voice.last, { force: true, slow });
}

function toggleVoice() {
  voice.on = !voice.on;
  if (!voice.on && canSpeak()) speechSynthesis.cancel();
  try {
    localStorage.setItem(VOICE_SETTING_KEY, voice.on ? "on" : "off");
  } catch (error) {
    // Can't save the setting (private window): it just resets next time.
  }
  drawVoiceButtons();
}

function drawVoiceButtons() {
  for (const button of document.querySelectorAll(".voice-button")) {
    button.classList.toggle("off", !voice.on);
    button.setAttribute("aria-pressed", String(voice.on));
    button.title = voice.on ? "Voix : oui (voice on)" : "Voix : non (voice off)";
  }
}

// ---------- Setup ----------

if (typeof document !== "undefined") {
  try {
    voice.on = localStorage.getItem(VOICE_SETTING_KEY) !== "off";
  } catch (error) {
    // No saved setting: the voice starts on.
  }
  if (canSpeak()) {
    for (const button of document.querySelectorAll(".voice-button")) button.addEventListener("click", toggleVoice);
    for (const button of document.querySelectorAll(".replay-button")) button.addEventListener("click", () => replayVoice(false));
    for (const button of document.querySelectorAll(".replay-slow-button")) button.addEventListener("click", () => replayVoice(true));
    drawVoiceButtons();
  } else {
    // This browser can't speak: hide every voice button.
    for (const button of document.querySelectorAll(".voice-button, .replay-button, .replay-slow-button")) button.hidden = true;
  }
}

if (typeof module !== "undefined") {
  module.exports = { frenchPart, VOICE_RATE, VOICE_SLOW_RATE };
}
