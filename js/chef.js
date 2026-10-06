// ============================================================
// chef.js — the mascot: Chef Barbe (a chef with a big beard).
//
//   CLOTHES             everything the shop sells (slot, price in stars)
//   drawChef(wearing)   returns the chef as an SVG picture, wearing his clothes
//   chefSays(stars)     a message that matches how well the player did
//
// The chef is drawn in layers: body → apron → face → beard → neck item →
// hat → accessory. Each clothing item is one small piece of SVG, and a
// beard item replaces his brown beard.
// ============================================================

// slot: hat, beard, neck, apron, extra (one item per slot at a time)
const CLOTHES = [
  { id: "cheese-hat", slot: "hat", price: 3, name: "le chapeau-fromage", en: "cheese hat" },
  { id: "mushroom-hat", slot: "hat", price: 3, name: "le chapeau-champignon", en: "mushroom cap" },
  { id: "croissant-hat", slot: "hat", price: 4, name: "la couronne-croissant", en: "croissant crown" },
  { id: "watermelon-hat", slot: "hat", price: 4, name: "le casque-pastèque", en: "watermelon helmet" },
  { id: "cake-hat", slot: "hat", price: 5, name: "la toque-gâteau", en: "strawberry cake hat" },
  { id: "cotton-candy-beard", slot: "beard", price: 3, name: "la barbe à papa", en: "cotton candy beard (barbe à papa = cotton candy!)" },
  { id: "jelly-beard", slot: "beard", price: 4, name: "la barbe en gelée", en: "wobbly jelly beard" },
  { id: "chocolate-beard", slot: "beard", price: 4, name: "la barbe en chocolat", en: "melted chocolate beard" },
  { id: "spaghetti-beard", slot: "beard", price: 5, name: "la barbe spaghetti", en: "spaghetti beard (with a meatball)" },
  { id: "farfalle-tie", slot: "neck", price: 1, name: "le nœud papillon farfalle", en: "bow-tie pasta bow tie" },
  { id: "sausage-necklace", slot: "neck", price: 2, name: "le collier de saucisses", en: "sausage necklace" },
  { id: "onion-necklace", slot: "neck", price: 2, name: "le collier d'oignons", en: "onion garland" },
  { id: "macaron-necklace", slot: "neck", price: 3, name: "le collier de macarons", en: "macaron necklace" },
  { id: "mariniere", slot: "apron", price: 2, name: "le tablier marinière", en: "sailor-striped apron" },
  { id: "strawberry-apron", slot: "apron", price: 3, name: "le tablier fraise", en: "strawberry apron" },
  { id: "watermelon-apron", slot: "apron", price: 3, name: "le tablier pastèque", en: "watermelon apron" },
  { id: "gold-apron", slot: "apron", price: 6, name: "le tablier doré", en: "golden apron" },
  { id: "baguette", slot: "extra", price: 1, name: "l'épée-baguette", en: "baguette sword" },
  { id: "lemon-glasses", slot: "extra", price: 2, name: "les lunettes-citron", en: "lemon-slice glasses" },
  { id: "pan-shield", slot: "extra", price: 3, name: "la poêle-bouclier", en: "frying-pan shield (with an egg)" },
  { id: "giant-whisk", slot: "extra", price: 3, name: "le fouet géant", en: "giant whisk" },
];

const SLOT_NAMES = {
  hat: "Les chapeaux (hats)",
  beard: "Les barbes (beards)",
  neck: "Les colliers (necklaces)",
  apron: "Les tabliers (aprons)",
  extra: "Les accessoires (extras)",
};

const OUTLINE = 'stroke="#3a2a20" stroke-width="2" stroke-linejoin="round"';

// The beard shape every beard uses.
const BEARD_PATH = "M36 70 Q33 116 60 126 Q87 116 84 70 Q80 92 60 97 Q40 92 36 70 Z";

// Spaghetti strands: wavy lines hanging from the chin, longer in the middle.
function spaghettiStrands() {
  let strands = "";
  for (let x = 38; x <= 82; x += 5) {
    const length = 40 - Math.abs(60 - x) * 0.7;
    strands += `<path d="M${x} ${82 + Math.abs(60 - x) * 0.2} q4 ${length / 4} 0 ${length / 2} q-4 ${length / 4} 0 ${length / 2}" fill="none" stroke="#f4c542" stroke-width="3.6" stroke-linecap="round"/>`;
  }
  return strands;
}

// Puffy circles for the cotton candy beard.
function cottonCandy() {
  const puffs = [[38, 76, 7], [82, 76, 7], [39, 88, 9], [81, 88, 9], [47, 99, 11], [73, 99, 11], [60, 103, 11],
    [50, 112, 10], [70, 112, 10], [60, 120, 10]];
  return puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff9ecf" stroke="#d66a9f" stroke-width="1.5"/>`).join("") +
    puffs.slice(0, 6).map(([x, y, r]) => `<circle cx="${x - r / 3}" cy="${y - r / 3}" r="${r / 3}" fill="#ffd1e8"/>`).join("");
}

// Things placed along the neckline (necklaces).
const NECK_POINTS = [[41, 100], [50, 106], [60, 108], [70, 106], [79, 100]];

// One SVG piece per clothing item.
const CLOTHES_SVG = {
  // ----- Hats -----
  "toque": // the default white chef's hat (worn when no hat is chosen)
    `<path d="M38 54 Q28 30 46 31 Q49 15 60 22 Q71 15 74 31 Q92 30 82 54 Z" fill="#fff" ${OUTLINE}/>
     <rect x="39" y="48" width="42" height="9" rx="3" fill="#fff" ${OUTLINE}/>`,
  "cheese-hat":
    `<path d="M32 56 L88 56 L88 28 Z" fill="#ffd23f" ${OUTLINE}/>
     <path d="M88 28 L94 24 L94 52 L88 56 Z" fill="#e8a917" ${OUTLINE}/>
     <circle cx="74" cy="47" r="4" fill="#e8a917"/><circle cx="82" cy="38" r="3" fill="#e8a917"/>
     <circle cx="62" cy="51" r="2.6" fill="#e8a917"/><circle cx="83" cy="50" r="2.2" fill="#e8a917"/>`,
  "mushroom-hat":
    `<path d="M26 54 Q28 18 60 16 Q92 18 94 54 Z" fill="#e63946" ${OUTLINE}/>
     <path d="M30 54 Q60 62 90 54" fill="#f6e7c8" ${OUTLINE}/>
     <circle cx="44" cy="34" r="5" fill="#fff"/><circle cx="62" cy="26" r="6" fill="#fff"/>
     <circle cx="78" cy="38" r="5" fill="#fff"/><circle cx="56" cy="44" r="3.5" fill="#fff"/>`,
  "croissant-hat":
    `<path d="M28 54 Q32 24 60 22 Q88 24 92 54 Q80 44 60 43 Q40 44 28 54 Z" fill="#eaa64d" ${OUTLINE}/>
     <path d="M42 30 Q48 38 45 47 M60 22 Q63 33 60 43 M78 30 Q72 38 75 47" fill="none" stroke="#b5671f" stroke-width="2.5" stroke-linecap="round"/>
     <path d="M48 27 Q52 25 56 26" fill="none" stroke="#ffd79a" stroke-width="2" stroke-linecap="round"/>`,
  "watermelon-hat":
    `<path d="M31 56 A29 31 0 0 1 89 56 Z" fill="#3cb64d" ${OUTLINE}/>
     <path d="M44 30 Q40 42 42 54 M60 25 L60 54 M76 30 Q80 42 78 54" fill="none" stroke="#24803a" stroke-width="3"/>
     <rect x="30" y="50" width="60" height="8" rx="3" fill="#ff4d5a" ${OUTLINE}/>
     <ellipse cx="42" cy="54" rx="1.4" ry="2" fill="#2b2420"/><ellipse cx="54" cy="54" rx="1.4" ry="2" fill="#2b2420"/>
     <ellipse cx="66" cy="54" rx="1.4" ry="2" fill="#2b2420"/><ellipse cx="78" cy="54" rx="1.4" ry="2" fill="#2b2420"/>`,
  "cake-hat":
    `<rect x="38" y="30" width="44" height="26" rx="5" fill="#f7d08a" ${OUTLINE}/>
     <rect x="38" y="40" width="44" height="5" fill="#fff"/>
     <path d="M38 34 Q38 28 44 28 L76 28 Q82 28 82 34 L82 36 Q78 41 74 36 Q70 42 66 36 Q61 41 57 36 Q52 42 48 36 Q43 41 38 36 Z" fill="#ff8fb1" ${OUTLINE}/>
     <path d="M60 28 Q52 18 58 12 Q64 8 66 16 Q68 22 60 28 Z" fill="#e63946" ${OUTLINE}/>
     <path d="M58 12 Q62 6 68 8 Q64 10 62 14 Z" fill="#3cb64d"/>`,
  // ----- Beards (replace the chef's brown beard) -----
  "jelly-beard":
    `<path class="chef-jelly" d="${BEARD_PATH}" fill="#ff3b6b" fill-opacity="0.78" ${OUTLINE}/>
     <ellipse cx="46" cy="100" rx="3" ry="8" transform="rotate(-20 46 100)" fill="#fff" opacity="0.65"/>
     <circle cx="70" cy="108" r="2.5" fill="#fff" opacity="0.6"/><circle cx="56" cy="114" r="1.8" fill="#fff" opacity="0.6"/>`,
  "spaghetti-beard":
    `${spaghettiStrands()}
     <circle cx="60" cy="116" r="7" fill="#8a4b2a" ${OUTLINE}/>
     <path d="M50 88 Q60 84 70 88 Q66 94 60 92 Q54 94 50 88 Z" fill="#e63946"/>`,
  "cotton-candy-beard": cottonCandy(),
  "chocolate-beard":
    `<path d="${BEARD_PATH}" fill="#5b3418" ${OUTLINE}/>
     <path d="M44 112 q2 12 5 0 M58 124 q2 12 5 0 M70 116 q2 10 4 0" fill="#5b3418" stroke="#3a2a20" stroke-width="1.5"/>
     <path d="M46 100 Q52 106 58 100 Q64 106 70 100" fill="none" stroke="#8a5530" stroke-width="2.5" stroke-linecap="round"/>`,
  // ----- Necklaces -----
  "farfalle-tie":
    `<path d="M60 104 L46 96 L48 100 L45 103 L48 106 L46 112 Z M60 104 L74 96 L72 100 L75 103 L72 106 L74 112 Z" fill="#f3d36b" ${OUTLINE}/>
     <ellipse cx="60" cy="104" rx="3.5" ry="5" fill="#e3b94a" ${OUTLINE}/>`,
  "sausage-necklace":
    NECK_POINTS.map(([x, y], i) =>
      `<ellipse cx="${x}" cy="${y}" rx="6" ry="3.6" transform="rotate(${[-35, -15, 0, 15, 35][i]} ${x} ${y})" fill="#c0623a" ${OUTLINE}/>
       <ellipse cx="${x - 1.5}" cy="${y - 1}" rx="2.2" ry="0.9" fill="#f0a07a"/>`).join(""),
  "onion-necklace":
    `<path d="M38 98 Q60 114 82 98" fill="none" stroke="#a87a3d" stroke-width="2"/>` +
    NECK_POINTS.map(([x, y]) =>
      `<path d="M${x} ${y - 7} Q${x + 7} ${y} ${x} ${y + 6} Q${x - 7} ${y} ${x} ${y - 7} Z" fill="#c7869b" ${OUTLINE}/>
       <path d="M${x} ${y - 4} Q${x + 3} ${y} ${x} ${y + 4}" fill="none" stroke="#f3d3dc" stroke-width="1.2"/>`).join(""),
  "macaron-necklace":
    NECK_POINTS.map(([x, y], i) => {
      const color = ["#ff8fb1", "#9be15d", "#ffd23f", "#b48cff", "#7fd3ff"][i];
      return `<rect x="${x - 6}" y="${y - 4.5}" width="12" height="9" rx="4.5" fill="${color}" ${OUTLINE}/>
              <rect x="${x - 6}" y="${y - 1}" width="12" height="2" fill="#fff8e7"/>`;
    }).join(""),
  // ----- Aprons -----
  "mariniere":
    `<path d="M41 112 L79 112 L81 150 L39 150 Z" fill="#fff" ${OUTLINE}/>
     <rect x="41" y="118" width="39" height="4" fill="#1f3a68"/><rect x="40" y="127" width="40" height="4" fill="#1f3a68"/>
     <rect x="40" y="136" width="40" height="4" fill="#1f3a68"/><rect x="40" y="145" width="41" height="4" fill="#1f3a68"/>
     <path d="M41 112 L79 112 L81 150 L39 150 Z" fill="none" ${OUTLINE}/>`,
  "strawberry-apron":
    `<path d="M41 112 L79 112 L81 150 L39 150 Z" fill="#e63946" ${OUTLINE}/>
     <path d="M41 112 L79 112 L76 118 L71 114 L66 119 L60 114 L54 119 L49 114 L44 118 Z" fill="#3cb64d" ${OUTLINE}/>
     <ellipse cx="50" cy="128" rx="1.4" ry="2.2" fill="#ffe66d"/><ellipse cx="62" cy="126" rx="1.4" ry="2.2" fill="#ffe66d"/>
     <ellipse cx="72" cy="132" rx="1.4" ry="2.2" fill="#ffe66d"/><ellipse cx="56" cy="138" rx="1.4" ry="2.2" fill="#ffe66d"/>
     <ellipse cx="68" cy="143" rx="1.4" ry="2.2" fill="#ffe66d"/><ellipse cx="46" cy="144" rx="1.4" ry="2.2" fill="#ffe66d"/>`,
  "watermelon-apron":
    `<path d="M41 112 L79 112 L81 150 L39 150 Z" fill="#ff4d5a" ${OUTLINE}/>
     <rect x="39.5" y="141" width="41" height="9" fill="#3cb64d"/><rect x="39.5" y="139" width="41" height="3" fill="#c7f0b8"/>
     <ellipse cx="50" cy="122" rx="1.5" ry="2.5" fill="#2b2420"/><ellipse cx="62" cy="128" rx="1.5" ry="2.5" fill="#2b2420"/>
     <ellipse cx="72" cy="120" rx="1.5" ry="2.5" fill="#2b2420"/><ellipse cx="54" cy="133" rx="1.5" ry="2.5" fill="#2b2420"/>
     <path d="M41 112 L79 112 L81 150 L39 150 Z" fill="none" ${OUTLINE}/>`,
  "gold-apron":
    `<path d="M41 112 L79 112 L81 150 L39 150 Z" fill="#f2c230" ${OUTLINE}/><path d="M50 128 l3 -6 l3 6 l-6 -4 h6 Z" fill="#fff8d6"/>
     <path d="M66 136 l2 -4 l2 4 l-4 -2.6 h4 Z" fill="#fff8d6"/>`,
  // ----- Extras -----
  "baguette":
    `<rect x="84" y="80" width="13" height="66" rx="6.5" transform="rotate(18 90 113)" fill="#d99a4e" ${OUTLINE}/>
     <path d="M91 92 l5 3 M89 102 l5 3 M87 112 l5 3 M85 122 l5 3" stroke="#a8682a" stroke-width="2" transform="rotate(18 90 113)"/>
     <rect x="78" y="128" width="22" height="5" rx="2" transform="rotate(18 90 113)" fill="#8a5530" ${OUTLINE}/>`,
  "lemon-glasses":
    `<circle cx="51" cy="68" r="7" fill="#fff36b" fill-opacity="0.75" stroke="#f2c230" stroke-width="2.5"/>
     <circle cx="69" cy="68" r="7" fill="#fff36b" fill-opacity="0.75" stroke="#f2c230" stroke-width="2.5"/>
     <path d="M51 61 V75 M44 68 H58 M46 63 L56 73 M56 63 L46 73 M69 61 V75 M62 68 H76 M64 63 L74 73 M74 63 L64 73" stroke="#f7e08a" stroke-width="1"/>
     <path d="M58 68 L62 68" stroke="#f2c230" stroke-width="2.5"/>`,
  "pan-shield":
    `<path d="M10 120 L-2 108" stroke="#3a2a20" stroke-width="6" stroke-linecap="round"/>
     <circle cx="22" cy="130" r="17" fill="#3d3d45" ${OUTLINE}/><circle cx="22" cy="130" r="13" fill="#55555f"/>
     <path d="M14 128 Q16 120 24 122 Q32 120 31 130 Q32 139 22 138 Q12 139 14 128 Z" fill="#fff"/>
     <circle cx="23" cy="130" r="4.5" fill="#ffc531" stroke="#e09a12" stroke-width="1"/>`,
  "giant-whisk":
    `<path d="M92 146 L100 112" stroke="#8a5530" stroke-width="6" stroke-linecap="round"/>
     <path d="M100 112 Q88 92 102 74 Q114 92 100 112 Z M100 112 Q94 92 102 74 Q108 92 100 112 Z" fill="none" stroke="#b9c3cc" stroke-width="2.2"/>
     <path d="M100 112 Q82 96 102 74" fill="none" stroke="#9aa6b0" stroke-width="2"/>`,
};

// The SVG for one slot, or "" when nothing (or an unknown old item) is worn.
function clothingPiece(wearing, slot) {
  return CLOTHES_SVG[wearing[slot]] || "";
}

// Returns the chef as SVG text. wearing = { hat: "beret", neck: ..., apron: ..., extra: ... }
function drawChef(wearing = {}, extraClass = "") {
  const hat = clothingPiece(wearing, "hat") || CLOTHES_SVG["toque"];
  const beard = clothingPiece(wearing, "beard") || `<path class="chef-beard" d="${BEARD_PATH}" fill="#7a4a2a" ${OUTLINE}/>`;
  return `<svg class="chef ${extraClass}" viewBox="-4 0 124 152" role="img" aria-label="Chef Barbe, la mascotte">
  <g class="chef-body">
    <path d="M27 152 Q27 103 60 101 Q93 103 93 152 Z" fill="#fff" ${OUTLINE}/>
    <circle cx="51" cy="122" r="2.5" fill="#cfc4b6"/><circle cx="51" cy="134" r="2.5" fill="#cfc4b6"/>
    <circle cx="69" cy="122" r="2.5" fill="#cfc4b6"/><circle cx="69" cy="134" r="2.5" fill="#cfc4b6"/>
    ${clothingPiece(wearing, "apron")}
    <circle cx="36" cy="72" r="5" fill="#f2c9a0" ${OUTLINE}/><circle cx="84" cy="72" r="5" fill="#f2c9a0" ${OUTLINE}/>
    <circle cx="60" cy="72" r="24" fill="#f2c9a0" ${OUTLINE}/>
    <circle cx="45" cy="80" r="4" fill="#f0a08a" opacity="0.6"/><circle cx="75" cy="80" r="4" fill="#f0a08a" opacity="0.6"/>
    <path d="M45 61 Q51 57 56 61 M64 61 Q69 57 75 61" fill="none" stroke="#5e3920" stroke-width="2.5" stroke-linecap="round"/>
    <g class="chef-eyes"><ellipse cx="51" cy="68" rx="2.8" ry="3.6" fill="#2b2420"/><ellipse cx="69" cy="68" rx="2.8" ry="3.6" fill="#2b2420"/></g>
    ${beard}
    <path d="M54 92 Q60 97 66 92" fill="none" stroke="#8e2a20" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M46 86 Q53 80 60 85 Q67 80 74 86 Q67 90 60 88 Q53 90 46 86 Z" fill="#5e3920" ${OUTLINE}/>
    <ellipse cx="60" cy="79" rx="5" ry="4" fill="#e8a984" ${OUTLINE}/>
    ${clothingPiece(wearing, "neck")}
    ${hat}
    ${clothingPiece(wearing, "extra")}
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
