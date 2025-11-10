import React, { useState } from "react";
import CardFace from "./components/CardFace";
import Settings from "./components/Settings";

// Use clear Unicode suit symbols for rendering and logic
const SUITS_UNICODE = ["♠", "♥", "♦", "♣"];

const SUITS = ["♣", "♦", "♥", "♠"];
const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

// ASCII-safe suit definitions using Unicode escapes
const SUITS_ASCII = ["\u2660", "\u2665", "\u2666", "\u2663"];
// Top-level exercise map keyed by Unicode escapes
export const EX_MAP = {
  "\u2660": "Burpees",
  "\u2665": "Squats",
  "\u2666": "Push-ups",
  "\u2663": "Sit-ups",
};

function makeDeck(numJokers = 1) {
  const deck = [];
  for (const s of SUITS_UNICODE) {
    for (const r of RANKS) deck.push({ suit: s, rank: r, id: `${r}${s}` });
  }
  for (let i = 0; i < numJokers; i++)
    deck.push({ suit: "🃏", rank: "Joker", id: `Joker${i}` });
  return deck;
}

// Deck builder that also marks red suits by index (hearts, diamonds)
function makeDeckV2(numJokers = 1) {
  const deck = [];
  for (let si = 0; si < SUITS_ASCII.length; si++) {
    const s = SUITS_ASCII[si];
    const isRed = si === 1 || si === 2;
    for (const r of RANKS)
      deck.push({ suit: s, rank: r, id: `${r}${s}`, isRed });
  }
  for (let i = 0; i < numJokers; i++)
    deck.push({ suit: "dY�?", rank: "Joker", id: `Joker${i}`, isRed: false });
  return deck;
}

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DEFAULT_EXERCISES = {
  "♣": "Burpees",
  "♦": "Squats",
  "♥": "Push-ups",
  "♠": "Sit-ups",
  "🃏": "2 min plank hold",
};

// Normalized exercise map keyed by Unicode suits
const EXERCISES = {
  "♠": "Burpees",
  "♥": "Squats",
  "♦": "Push-ups",
  "♣": "Sit-ups",
};

export default function DeckOfCardsWorkout() {
  const [numJokers, setNumJokers] = useState(1);
  const [deck, setDeck] = useState(() => shuffle(makeDeckV2(1)));
  const [current, setCurrent] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [exMap, setExMap] = useState(EX_MAP);
  const [jokerWorkouts, setJokerWorkouts] = useState([
    "2 min plank hold",
    "20 jump squats",
    "20 leg lifts",
  ]);
  const [difficulty, setDifficulty] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [aceHigh, setAceHigh] = useState(false); // false => 1 rep, true => 14 reps

  // Load settings from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("docw_settings");
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.numJokers === "number") setNumJokers(s.numJokers);
        if (s.exMap && typeof s.exMap === "object") setExMap(s.exMap);
        if (Array.isArray(s.jokerWorkouts)) setJokerWorkouts(s.jokerWorkouts);
        else if (typeof s.jokerWorkout === "string")
          setJokerWorkouts([s.jokerWorkout]);
        if (typeof s.difficulty === "number") setDifficulty(s.difficulty);
        if (typeof s.aceHigh === "boolean") setAceHigh(s.aceHigh);
      }
    } catch {}
  }, []);

  // Persist settings to localStorage
  React.useEffect(() => {
    try {
      const data = { numJokers, exMap, jokerWorkouts, difficulty, aceHigh };
      localStorage.setItem("docw_settings", JSON.stringify(data));
    } catch {}
  }, [numJokers, exMap, jokerWorkouts, difficulty, aceHigh]);

  // ASCII-safe exercise map keyed by Unicode escapes (used by CardFace colors too)
  const EXERCISES_ASCII = {
    "\u2660": "Burpees",
    "\u2665": "Squats",
    "\u2666": "Push-ups",
    "\u2663": "Sit-ups",
  };

  function drawCard() {
    if (deck.length === 0) {
      setCurrent({ rank: "BACK", suit: "", id: "end" });
      return;
    }
    const next = { ...deck[0] };
    if (next.rank === "Joker") {
      const choices = (jokerWorkouts || [])
        .map((s) => (s || "").trim())
        .filter(Boolean);
      const picked = choices.length
        ? choices[Math.floor(Math.random() * choices.length)]
        : "Wildcard (Joker Workout)";
      next.jokerWorkoutPick = picked;
    }
    setDeck((d) => d.slice(1));
    setCurrent(next);
  }

  function handleCardClick() {
    setHasStarted(true);
    setFlipped(true);
    setTimeout(() => {
      setFlipped(false);
      drawCard();
    }, 200);
  }

  const repsFor = (card) => {
    if (!card || card.rank === "Joker" || card.rank === "BACK") return 0;
    const base = isNaN(card.rank)
      ? { A: aceHigh ? 14 : 1, J: 11, Q: 12, K: 13 }[card.rank]
      : Number(card.rank);
    return Math.round(base * difficulty);
  };

  const exerciseFor = (card) => {
    if (!card) return "";
    if (card.rank === "Joker")
      return card.jokerWorkoutPick || "Wildcard (Joker Workout)";
    return exMap[card.suit] || "";
  };
  const showBack = !current || current.rank === "BACK";
  const isEndOfDeck = current?.id === "end";
  const totalCards = 52 + numJokers;
  // Count drawn cards: total - remaining. First drawn card should be 1.
  const progressIndex = Math.min(totalCards, Math.max(0, totalCards - deck.length));

  // Rebuild deck when numJokers changes
  React.useEffect(() => {
    setDeck(shuffle(makeDeckV2(numJokers)));
    setCurrent(null);
    setFlipped(false);
    setHasStarted(false);
  }, [numJokers]);

  // Robust exercise resolver using rank for Joker
  const exerciseFor2 = (card) => {
    if (!card) return "";
    if (card.rank === "Joker") return jokerWorkout;
    return exMap[card.suit] || "";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="px-4 py-2 bg-blue-600 rounded-lg shadow"
        >
          {showSettings ? "Close Settings" : "Settings"}
        </button>
        <button
          onClick={() => {
            setDeck(shuffle(makeDeckV2(numJokers)));
            setCurrent(null);
            setFlipped(false);
            setHasStarted(false);
          }}
          className="px-4 py-2 bg-red-600 rounded-lg shadow"
        >
          Restart
        </button>
      </div>

      {showSettings && (
        <Settings
          numJokers={numJokers}
          setNumJokers={setNumJokers}
          exMap={exMap}
          setExMap={setExMap}
          jokerWorkouts={jokerWorkouts}
          setJokerWorkouts={setJokerWorkouts}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          aceHigh={aceHigh}
          setAceHigh={setAceHigh}
        />
      )}

      <div
        onClick={handleCardClick}
        className={`transition-transform duration-200 ease-in-out ${
          flipped ? "scale-90 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <CardFace
          card={current}
          reps={repsFor(current)}
          workout={exerciseFor(current)}
          showBack={showBack}
          isFlipped={!!current}
        />
        {isEndOfDeck && (
          <p className="mt-4 text-lg font-semibold text-white" style={{ color: '#ffffff' }}>
            Hell yeah brother, you crushed the workout!
          </p>
        )}
      </div>

      {hasStarted ? (
        <div
          className="mt-8 text-xs text-white text-center"
          style={{ color: "#ffffff" }}
        >{`${progressIndex}/${totalCards}`}</div>
      ) : (
        <footer
          className="mt-8 text-xs text-white text-center"
          style={{ color: "#ffffff" }}
        >
          Tap the card to commence the suffering.
        </footer>
      )}
    </div>
  );
}
