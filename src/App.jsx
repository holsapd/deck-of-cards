import React, { useEffect, useState } from "react";
import CardFace from "./components/CardFace";

const SUITS = ["♣", "♦", "♥", "♠"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function makeDeck(numJokers = 1) {
  const deck = [];
  for (const s of SUITS) {
    for (const r of RANKS) deck.push({ suit: s, rank: r, id: `${r}${s}` });
  }
  for (let i = 0; i < numJokers; i++)
    deck.push({ suit: "🃏", rank: "Joker", id: `Joker${i}` });
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
  "🃏": "Wildcard (Joker Workout)",
};

export default function DeckOfCardsWorkout() {
  const [deck, setDeck] = useState(() => shuffle(makeDeck(1)));
  const [current, setCurrent] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [exMap, setExMap] = useState(DEFAULT_EXERCISES);

  function drawCard() {
    if (deck.length === 0) {
      setCurrent({ rank: "BACK", suit: "", id: "end" });
      return;
    }
    const next = deck[0];
    setDeck((d) => d.slice(1));
    setCurrent(next);
  }

  function handleCardClick() {
    // Flip animation
    setFlipped(true);
    setTimeout(() => {
      setFlipped(false);
      drawCard();
    }, 200); // short flip duration
  }

  const repsFor = (card) => {
    if (!card || card.rank === "Joker" || card.rank === "BACK") return 0;
    const base = isNaN(card.rank) ? { A: 1, J: 11, Q: 12, K: 13 }[card.rank] : Number(card.rank);
    return base;
  };

  const exerciseFor = (card) => {
    if (!card) return "";
    return exMap[card.suit] || (card.rank === "Joker" ? exMap["🃏"] : "");
  };

  // Initial card back
  const showBack = !current || current.rank === "BACK";
  const showJoker = current?.rank === "Joker";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 rounded-lg shadow"
        >
          Restart
        </button>
      </div>

      <div
        onClick={handleCardClick}
        className={`transition-transform duration-200 ease-in-out ${
          flipped ? "scale-90 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {showBack ? (
          <div className="flex flex-col items-center">
            <img
              src={`${import.meta.env.BASE_URL}patriotic-playing-card.png`}
              alt="Card Back"
              className="max-h-[80vh] w-auto object-contain rounded-lg shadow-xl"
            />
            {current?.id === "end" ? (
              <p className="mt-4 text-lg font-semibold text-white">
                Congrats, you crushed the workout!
              </p>
            ) : (
              <p className="mt-4 text-sm text-gray-300">
                Flip the card to commence the suffering
              </p>
            )}
          </div>
        ) : showJoker ? (
          <CardFace
            card={current}
            exercise={exerciseFor(current)}
            reps={0}
          />
        ) : (
          <CardFace
            card={current}
            exercise={exerciseFor(current)}
            reps={repsFor(current)}
          />
        )}
      </div>

      <footer className="mt-8 text-xs text-gray-500 text-center">
        Tap card for next • Made with ❤️ — Deck of Cards Workout (Offline PWA)
      </footer>
    </div>
  );
}
