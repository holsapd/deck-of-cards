const SUITS_UNICODE = ["\u2660", "\u2665", "\u2666", "\u2663"];
const SUITS_ASCII = ["\u2660", "\u2665", "\u2666", "\u2663"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export const DECK_SIZE_LIMITS = {
  quarter: 13,
  half: 26,
  threequarters: 39,
  full: 52,
};

export function makeDeck(numJokers = 1) {
  const deck = [];
  for (const s of SUITS_UNICODE) {
    for (const r of RANKS) deck.push({ suit: s, rank: r, id: `${r}${s}` });
  }
  for (let i = 0; i < numJokers; i++)
    deck.push({ suit: "JOKER", rank: "Joker", id: `Joker${i}` });
  return deck;
}

export function makeDeckV2(numJokers = 1, deckSize = "full") {
  const normalizedSize =
    DECK_SIZE_LIMITS[deckSize] !== undefined ? deckSize : "full";
  const cardLimit = DECK_SIZE_LIMITS[normalizedSize];
  const standardCards = [];
  for (let si = 0; si < SUITS_ASCII.length; si++) {
    const s = SUITS_ASCII[si];
    const isRed = si === 1 || si === 2;
    for (const r of RANKS)
      standardCards.push({ suit: s, rank: r, id: `${r}${s}`, isRed });
  }
  const trimmed = shuffle(standardCards).slice(0, cardLimit);
  const jokers = Array.from({ length: numJokers }, (_, i) => ({
    suit: "JOKER",
    rank: "Joker",
    id: `Joker-${i}-${Math.random().toString(36).slice(2, 8)}`,
    isRed: false,
  }));
  return shuffle([...trimmed, ...jokers]);
}

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
