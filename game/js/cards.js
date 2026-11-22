// EMBERFALL DUEL - card definitions and deck building.
// Every card carries a printed cost, a kind, and a big value so a
// screenshot reader can tell cards apart by colour, shape and number.

export const KIND_STYLE = {
  strike:   { label: "STRIKE",   colour: "#ff5a1f", dark: "#3d1204", glyph: "sword" },
  guard:    { label: "GUARD",    colour: "#f2b134", dark: "#332304", glyph: "shield" },
  kindling: { label: "KINDLING", colour: "#39d0a5", dark: "#06382c", glyph: "spark" },
  wildfire: { label: "WILDFIRE", colour: "#c44dff", dark: "#2c0a3d", glyph: "flame" },
};

export const CARD_CATALOG = [
  { id: "cinder-jab",     name: "Cinder Jab",     kind: "strike",   cost: 1, value: 3, text: "Deal 3 damage." },
  { id: "ember-slash",    name: "Ember Slash",    kind: "strike",   cost: 1, value: 4, text: "Deal 4 damage." },
  { id: "flame-lance",    name: "Flame Lance",    kind: "strike",   cost: 2, value: 6, text: "Deal 6 damage." },
  { id: "pyre-cleaver",   name: "Pyre Cleaver",   kind: "strike",   cost: 2, value: 5, text: "Deal 5 damage." },
  { id: "inferno-hammer", name: "Inferno Hammer", kind: "strike",   cost: 3, value: 8, text: "Deal 8 damage." },
  { id: "ashen-shield",   name: "Ashen Shield",   kind: "guard",    cost: 1, value: 4, text: "Gain 4 Shield." },
  { id: "ember-ward",     name: "Ember Ward",     kind: "guard",    cost: 1, value: 3, text: "Gain 3 Shield." },
  { id: "obsidian-wall",  name: "Obsidian Wall",  kind: "guard",    cost: 2, value: 7, text: "Gain 7 Shield." },
  { id: "stoke-flames",   name: "Stoke Flames",   kind: "kindling", cost: 1, value: 2, text: "Draw 2 cards." },
  { id: "gather-embers",  name: "Gather Embers",  kind: "kindling", cost: 0, value: 1, text: "+1 Energy, draw 1." },
  { id: "rekindle",       name: "Rekindle",       kind: "kindling", cost: 2, value: 3, text: "Draw 3 cards." },
  { id: "wildfire-hex",   name: "Wildfire Hex",   kind: "wildfire", cost: 2, value: 2, text: "Burn 2 for 2 turns." },
  { id: "blazing-curse",  name: "Blazing Curse",  kind: "wildfire", cost: 3, value: 3, text: "Burn 3 for 2 turns." },
];

const DECK_RECIPE = [
  "cinder-jab", "cinder-jab", "ember-slash", "ember-slash", "flame-lance",
  "pyre-cleaver", "inferno-hammer", "ashen-shield", "ashen-shield", "ember-ward",
  "obsidian-wall", "stoke-flames", "stoke-flames", "gather-embers", "gather-embers",
  "rekindle", "wildfire-hex", "wildfire-hex", "blazing-curse", "flame-lance",
];

let nextInstance = 1;

export function makeSeededRandom(seed) {
  let state = (seed >>> 0) || 1;
  return function random() {
    state ^= state << 13; state >>>= 0;
    state ^= state >> 17;
    state ^= state << 5; state >>>= 0;
    return state / 4294967296;
  };
}

export function buildDeck(random) {
  const byId = new Map(CARD_CATALOG.map((c) => [c.id, c]));
  const deck = DECK_RECIPE.map((id) => {
    const base = byId.get(id);
    return { ...base, uid: "card-" + nextInstance++ };
  });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
  }
  return deck;
}

export function cardById(id) {
  const base = CARD_CATALOG.find((c) => c.id === id);
  return base ? { ...base, uid: "card-" + nextInstance++ } : null;
}
