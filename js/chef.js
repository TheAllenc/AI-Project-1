// ============================================================
// chef.js — the mascot: Chef Barbe (a chef with a big beard).
//
//   CLOTHES             everything the shop sells (slot, price in stars)
//   drawChef(wearing)   returns the chef as an SVG picture, wearing his clothes
//   chefSays(stars)     a message that matches how well the player did
//
// The chef is drawn in layers: body → apron → face → beard → neck item →
// hat → accessory. Each clothing item is one small piece of SVG.
// ============================================================

// slot: hat, neck, apron, extra (one item per slot at a time)
const CLOTHES = [
  { id: "beret", slot: "hat", price: 4, name: "le béret", en: "beret" },
  { id: "top-hat", slot: "hat", price: 7, name: "le haut-de-forme", en: "top hat" },
  { id: "gold-toque", slot: "hat", price: 10, name: "la toque dorée", en: "golden chef's hat" },
  { id: "crown", slot: "hat", price: 14, name: "la couronne", en: "crown" },
  { id: "bow-tie", slot: "neck", price: 3, name: "le nœud papillon", en: "bow tie" },
  { id: "neckerchief", slot: "neck", price: 4, name: "le foulard rouge", en: "red neckerchief" },
  { id: "tricolor-scarf", slot: "neck", price: 6, name: "l’écharpe tricolore", en: "French flag scarf" },
  { id: "blue-apron", slot: "apron", price: 3, name: "le tablier bleu", en: "blue apron" },
  { id: "striped-apron", slot: "apron", price: 6, name: "le tablier rayé", en: "striped apron" },
  { id: "gold-apron", slot: "apron", price: 9, name: "le tablier doré", en: "golden apron" },
  { id: "glasses", slot: "extra", price: 3, name: "les lunettes", en: "glasses" },
  { id: "spoon", slot: "extra", price: 4, name: "la cuillère en bois", en: "wooden spoon" },
  { id: "baguette", slot: "extra", price: 5, name: "la baguette", en: "baguette" },
  { id: "monocle", slot: "extra", price: 8, name: "le monocle", en: "monocle" },
];

const SLOT_NAMES = {
  hat: "Les chapeaux (hats)",
  neck: "Le cou (neck)",
  apron: "Les tabliers (aprons)",
  extra: "Les accessoires (extras)",
};

const OUTLINE = 'stroke="#3a2a20" stroke-width="2" stroke-linejoin="round"';

// One SVG piece per clothing item.
const CLOTHES_SVG = {
  // Hats
  "toque": // the default white chef's hat (worn when no hat is chosen)
    `<path d="M38 54 Q28 30 46 31 Q49 15 60 22 Q71 15 74 31 Q92 30 82 54 Z" fill="#fff" ${OUTLINE}/>
     <rect x="39" y="48" width="42" height="9" rx="3" fill="#fff" ${OUTLINE}/>`,
  "beret":
    `<g transform="rotate(-12 60 48)"><ellipse cx="60" cy="48" rx="28" ry="10" fill="#c0392b" ${OUTLINE}/>
     <circle cx="60" cy="37" r="3" fill="#c0392b" ${OUTLINE}/></g>`,
  "top-hat":
    `<rect x="44" y="16" width="32" height="34" rx="2" fill="#26211e" ${OUTLINE}/>
     <rect x="44" y="40" width="32" height="6" fill="#a0282c"/>
     <rect x="33" y="47" width="54" height="7" rx="3" fill="#26211e" ${OUTLINE}/>`,
  "gold-toque":
    `<path d="M38 54 Q28 30 46 31 Q49 15 60 22 Q71 15 74 31 Q92 30 82 54 Z" fill="#f2c230" ${OUTLINE}/>
     <rect x="39" y="48" width="42" height="9" rx="3" fill="#e0a91c" ${OUTLINE}/>
     <circle cx="60" cy="36" r="3" fill="#fff8d6"/>`,
  "crown":
    `<path d="M38 56 L39 30 L50 43 L60 24 L70 43 L81 30 L82 56 Z" fill="#f2c230" ${OUTLINE}/>
     <circle cx="60" cy="47" r="3.5" fill="#c0392b"/><circle cx="47" cy="49" r="2.5" fill="#2a6f97"/><circle cx="73" cy="49" r="2.5" fill="#2e8b57"/>`,
  // Neck
  "bow-tie":
    `<path d="M60 104 L47 97 L47 111 Z M60 104 L73 97 L73 111 Z" fill="#c0392b" ${OUTLINE}/>
     <circle cx="60" cy="104" r="3.5" fill="#8e2a20" ${OUTLINE}/>`,
  "neckerchief":
    `<path d="M44 99 L76 99 L60 118 Z" fill="#c0392b" ${OUTLINE}/>`,
  "tricolor-scarf":
    `<rect x="40" y="98" width="13" height="9" fill="#2a4fa0"/><rect x="53" y="98" width="14" height="9" fill="#fff"/>
     <rect x="67" y="98" width="13" height="9" fill="#d23a33"/>
     <rect x="40" y="98" width="40" height="9" rx="3" fill="none" ${OUTLINE}/>
     <path d="M68 106 L74 124 L80 122 L76 106 Z" fill="#d23a33" ${OUTLINE}/>`,
  // Aprons
  "blue-apron":
    `<path d="M41 112 L79 112 L81 150 L39 150 Z" fill="#2a6f97" ${OUTLINE}/><rect x="52" y="124" width="16" height="10" rx="2" fill="#24618a"/>`,
  "striped-apron":
    `<path d="M41 112 L79 112 L81 150 L39 150 Z" fill="#fff" ${OUTLINE}/>
     <rect x="41" y="118" width="39" height="4" fill="#1f3a68"/><rect x="40" y="127" width="40" height="4" fill="#1f3a68"/>
     <rect x="40" y="136" width="40" height="4" fill="#1f3a68"/><rect x="40" y="145" width="41" height="4" fill="#1f3a68"/>
     <path d="M41 112 L79 112 L81 150 L39 150 Z" fill="none" ${OUTLINE}/>`,
  "gold-apron":
    `<path d="M41 112 L79 112 L81 150 L39 150 Z" fill="#f2c230" ${OUTLINE}/><path d="M50 128 l3 -6 l3 6 l-6 -4 h6 Z" fill="#fff8d6"/>`,
  // Extras
  "glasses":
    `<circle cx="51" cy="68" r="6.5" fill="none" stroke="#26211e" stroke-width="2"/>
     <circle cx="69" cy="68" r="6.5" fill="none" stroke="#26211e" stroke-width="2"/>
     <path d="M57.5 68 L62.5 68" stroke="#26211e" stroke-width="2"/>`,
  "monocle":
    `<circle cx="69" cy="68" r="7" fill="none" stroke="#d4a017" stroke-width="2.5"/>
     <path d="M76 70 Q82 86 78 100" fill="none" stroke="#d4a017" stroke-width="1.5"/>`,
  "spoon":
    `<path d="M92 140 L106 100" stroke="#a0662b" stroke-width="5" stroke-linecap="round"/>
     <ellipse cx="108" cy="94" rx="6" ry="9" transform="rotate(20 108 94)" fill="#c08040" ${OUTLINE}/>`,
  "baguette":
    `<rect x="84" y="88" width="13" height="58" rx="6.5" transform="rotate(18 90 117)" fill="#d99a4e" ${OUTLINE}/>
     <path d="M91 98 l5 3 M89 108 l5 3 M87 118 l5 3 M85 128 l5 3" stroke="#a8682a" stroke-width="2" transform="rotate(18 90 117)"/>`,
};

// Returns the chef as SVG text. wearing = { hat: "beret", neck: ..., apron: ..., extra: ... }
function drawChef(wearing = {}, extraClass = "") {
  const piece = (slot) => (wearing[slot] ? CLOTHES_SVG[wearing[slot]] : "");
  return `<svg class="chef ${extraClass}" viewBox="0 0 120 152" role="img" aria-label="Chef Barbe, la mascotte">
  <g class="chef-body">
    <path d="M27 152 Q27 103 60 101 Q93 103 93 152 Z" fill="#fff" ${OUTLINE}/>
    <circle cx="51" cy="122" r="2.5" fill="#cfc4b6"/><circle cx="51" cy="134" r="2.5" fill="#cfc4b6"/>
    <circle cx="69" cy="122" r="2.5" fill="#cfc4b6"/><circle cx="69" cy="134" r="2.5" fill="#cfc4b6"/>
    ${piece("apron")}
    <circle cx="36" cy="72" r="5" fill="#f2c9a0" ${OUTLINE}/><circle cx="84" cy="72" r="5" fill="#f2c9a0" ${OUTLINE}/>
    <circle cx="60" cy="72" r="24" fill="#f2c9a0" ${OUTLINE}/>
    <circle cx="45" cy="80" r="4" fill="#f0a08a" opacity="0.6"/><circle cx="75" cy="80" r="4" fill="#f0a08a" opacity="0.6"/>
    <path d="M45 61 Q51 57 56 61 M64 61 Q69 57 75 61" fill="none" stroke="#5e3920" stroke-width="2.5" stroke-linecap="round"/>
    <g class="chef-eyes"><ellipse cx="51" cy="68" rx="2.8" ry="3.6" fill="#2b2420"/><ellipse cx="69" cy="68" rx="2.8" ry="3.6" fill="#2b2420"/></g>
    <path class="chef-beard" d="M36 70 Q33 116 60 126 Q87 116 84 70 Q80 92 60 97 Q40 92 36 70 Z" fill="#7a4a2a" ${OUTLINE}/>
    <path d="M54 92 Q60 97 66 92" fill="none" stroke="#8e2a20" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M46 86 Q53 80 60 85 Q67 80 74 86 Q67 90 60 88 Q53 90 46 86 Z" fill="#5e3920" ${OUTLINE}/>
    <ellipse cx="60" cy="79" rx="5" ry="4" fill="#e8a984" ${OUTLINE}/>
    ${piece("neck")}
    ${wearing.hat ? piece("hat") : CLOTHES_SVG["toque"]}
    ${piece("extra")}
  </g>
</svg>`;
}

// What the chef says, depending on the stars (1, 2 or 3).
const CHEF_MESSAGES = {
  3: [
    "Excellent travail ! (Great work!)",
    "Magnifique ! Tu es un vrai chef ! (You're a real chef!)",
    "Bravo ! Quel chef ! (What a chef!)",
  ],
  2: [
    "Pas mal du tout ! (Not bad at all!)",
    "Bien joué ! Encore un petit effort ! (Well done, keep going!)",
  ],
  1: [
    "Essaie encore, tu peux le faire ! (Try again, you got this!)",
    "Courage ! C'est en cuisinant qu'on devient chef ! (Keep practicing!)",
  ],
};

function chefSays(stars) {
  const options = CHEF_MESSAGES[Math.max(1, Math.min(3, stars))];
  return options[Math.floor(Math.random() * options.length)];
}

// Turns a level total (e.g. 7 out of 9) into a 1–3 "mood" for the chef.
function moodForTotal(total, max) {
  const ratio = max > 0 ? total / max : 0;
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.55) return 2;
  return 1;
}

if (typeof module !== "undefined") {
  module.exports = { CLOTHES, SLOT_NAMES, CLOTHES_SVG, drawChef, chefSays, moodForTotal };
}
