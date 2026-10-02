// ============================================================
// sound.js — little beeps made by the browser (no sound files needed).
//   playSound("good")  a happy two-note ding
//   playSound("bad")   a low buzz
//   playSound("done")  a short tune when a recipe is finished
// The 🔊 button turns sound on and off.
// ============================================================

const sound = {
  on: true,
  context: null, // created on the first sound (browsers only allow audio after a click)
};

// Each sound is a list of notes: [frequency in Hz, start time in seconds].
const SOUNDS = {
  good: { wave: "sine", notes: [[660, 0], [880, 0.09]] },
  bad: { wave: "square", notes: [[180, 0], [150, 0.1]] },
  done: { wave: "triangle", notes: [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36]] },
};

function playSound(kind) {
  if (!sound.on) return;
  try {
    if (!sound.context) sound.context = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = sound.context;
    const { wave, notes } = SOUNDS[kind];

    for (const [frequency, start] of notes) {
      const oscillator = ctx.createOscillator();
      const volume = ctx.createGain();
      const t = ctx.currentTime + start;
      oscillator.type = wave;
      oscillator.frequency.value = frequency;
      volume.gain.setValueAtTime(0.12, t);
      volume.gain.exponentialRampToValueAtTime(0.001, t + 0.15); // fade out quickly
      oscillator.connect(volume).connect(ctx.destination);
      oscillator.start(t);
      oscillator.stop(t + 0.16);
    }
  } catch (error) {
    // No sound available (old browser or blocked): the game works fine without it.
  }
}

function toggleSound() {
  sound.on = !sound.on;
  for (const button of document.querySelectorAll(".sound-button")) {
    button.textContent = sound.on ? "🔊" : "🔇";
    button.setAttribute("aria-label", sound.on ? "Couper le son (mute)" : "Activer le son (unmute)");
  }
}
