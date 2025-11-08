import React, { useEffect, useState, useRef } from "react";
import CardFlip from "./components/CardFlip";

// Deck of Cards Workout - React PWA + animated card flips

const SUITS = ["♣", "♦", "♥", "♠"];
const RANKS = [
  "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K",
];

function makeDeck(numJokers = 1) {
  const deck = [];
  for (const s of SUITS) {
    for (const r of RANKS) {
      deck.push({ suit: s, rank: r, id: `${r}${s}` });
    }
  }
  for (let i = 0; i < numJokers; i++) {
    deck.push({ suit: "🃏", rank: "Joker", id: `Joker${i}` });
  }
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
};

const DEFAULT_VALUE_MAP = {
  A: 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
};

export default function DeckOfCardsWorkout() {
  const [deck, setDeck] = useState(() => shuffle(makeDeck()));
  const [hand, setHand] = useState([]);
  const [current, setCurrent] = useState(null);
  const [exMap, setExMap] = useState(() => {
    try {
      const raw = localStorage.getItem("docw_exmap");
      return raw ? JSON.parse(raw) : DEFAULT_EXERCISES;
    } catch (e) {
      return DEFAULT_EXERCISES;
    }
  });
  const [valMap, setValMap] = useState(() => {
    try {
      const raw = localStorage.getItem("docw_valmap");
      return raw ? JSON.parse(raw) : DEFAULT_VALUE_MAP;
    } catch (e) {
      return DEFAULT_VALUE_MAP;
    }
  });
  const [difficulty, setDifficulty] = useState(() => {
    const raw = localStorage.getItem("docw_diff");
    return raw ? Number(raw) : 1;
  });

  const [autoDraw, setAutoDraw] = useState(false);
  const [intervalSec, setIntervalSec] = useState(30);
  const autoTimerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("docw_exmap", JSON.stringify(exMap));
  }, [exMap]);
  useEffect(() => {
    localStorage.setItem("docw_valmap", JSON.stringify(valMap));
  }, [valMap]);
  useEffect(() => {
    localStorage.setItem("docw_diff", String(difficulty));
  }, [difficulty]);

  useEffect(() => {
    if (autoDraw) {
      autoTimerRef.current = setInterval(() => drawCard(), intervalSec * 1000);
    } else if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [autoDraw, intervalSec, deck]);

  function drawCard() {
    if (deck.length === 0) {
      setCurrent(null);
      return;
    }
    const next = deck[0];
    setDeck((d) => d.slice(1));
    setHand((h) => [next, ...h]);
    setCurrent(next);
  }

  function resetDeck() {
    setDeck(shuffle(makeDeck()));
    setHand([]);
    setCurrent(null);
    setAutoDraw(false);
  }

  function repsFor(card) {
    if (!card) return 0;
    const base = valMap[card.rank] ?? 0;
    return Math.max(1, Math.round(base * difficulty));
  }

  function undoLast() {
    if (hand.length === 0) return;
    const [last, ...rest] = hand;
    setDeck((d) => [last, ...d]);
    setHand(rest);
    setCurrent(rest[0] ?? null);
  }

  function exportSession() {
    const payload = {
      date: new Date().toISOString(),
      hand,
      exMap,
      valMap,
      difficulty,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deck-workout-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Deck of Cards Workout</h1>
          <div className="text-sm text-slate-600">Cards left: {deck.length}</div>
        </header>

        <main className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2">
            <div className="flex gap-4 items-center">
              <button
                onClick={drawCard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
              >
                Draw Card
              </button>
              <button
                onClick={() => setDeck((d) => shuffle(d))}
                className="px-4 py-2 bg-amber-400 text-slate-800 rounded-lg shadow"
              >
                Shuffle Remaining
              </button>
              <button
                onClick={resetDeck}
                className="px-4 py-2 bg-red-500 text-white rounded-lg shadow"
              >
                Reset Deck
              </button>
              <button
                onClick={undoLast}
                className="px-4 py-2 bg-gray-200 text-slate-800 rounded-lg"
              >
                Undo
              </button>
              <button
                onClick={exportSession}
                className="px-3 py-2 bg-green-600 text-white rounded-lg"
              >
                Export Session
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center bg-slate-50 p-4 rounded-lg">
  {current ? (
    <>
      <CardFlip card={current} />
      <div className="mt-4 text-lg font-medium">
        {exMap[current.suit]} — {repsFor(current)} reps
      </div>
    </>
  ) : (
    <div className="text-slate-600">No card drawn yet — press Draw Card.</div>
  )}
</div>

            <div className="mt-4">
              <h3 className="font-semibold">Session history</h3>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {hand.length === 0 && <div className="text-slate-500">No cards yet</div>}
                {hand.map((c) => (
                  <div key={c.id} className="p-2 border rounded flex items-center gap-2">
                    <div className="text-2xl">{c.suit}</div>
                    <div className="text-sm">
                      <div>{c.rank}</div>
                      <div className="text-xs text-slate-500">{exMap[c.suit]} • {repsFor(c)} reps</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside>
            <h3 className="font-semibold">Settings</h3>
            <div className="mt-3 space-y-3 bg-slate-50 p-3 rounded">
              <div>
                <label className="text-sm">Suit → Exercise</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {SUITS.map((s) => (
                    <div key={s} className="flex flex-col">
                      <span className="text-2xl">{s}</span>
                      <input
                        value={exMap[s]}
                        onChange={(e) => setExMap((m) => ({ ...m, [s]: e.target.value }))}
                        className="mt-1 p-2 rounded border"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm">Difficulty multiplier: {difficulty}x</label>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-sm">Auto-draw</label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={autoDraw}
                    onChange={(e) => setAutoDraw(e.target.checked)}
                  />
                  <div className="text-sm text-slate-600">Draw every</div>
                  <input
                    type="number"
                    value={intervalSec}
                    min={5}
                    onChange={(e) => setIntervalSec(Number(e.target.value))}
                    className="w-20 p-1 rounded border"
                  />
                  <div className="text-sm text-slate-600">seconds</div>
                </div>
              </div>

              <div>
                <label className="text-sm">Value mapping (face cards default to J=11 Q=12 K=13)</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.keys(valMap).map((k) => (
                    <div key={k} className="flex items-center gap-2">
                      <div className="w-8">{k}</div>
                      <input
                        className="p-1 rounded border w-full"
                        value={valMap[k]}
                        onChange={(e) => setValMap((v) => ({ ...v, [k]: Number(e.target.value) }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              Tip: map suits to movements you like. Face cards can be sets or sprints. Use difficulty to scale.
            </div>
          </aside>
        </main>

        <footer className="mt-6 text-center text-xs text-slate-500">Made with ❤️ — Deck of Cards Workout (Offline PWA)</footer>
      </div>
    </div>
  );
}
