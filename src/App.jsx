import React, { useState, useEffect } from "react";
import CardFlip from "./components/CardFlip";
import patrioticBack from "./assets/patriotic-playing-card.png";
import patrioticJoker from "./assets/patriotic-joker.png";

// ---- Constants -------------------------------------------------------------
const SUITS = ["♣", "♦", "♥", "♠"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

const DEFAULT_EXERCISES = {
  "♣": "Burpees",
  "♦": "Squats",
  "♥": "Push-ups",
  "♠": "Sit-ups",
};
const DEFAULT_VALUE_MAP = {
  A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6,
  "7": 7, "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13,
};

// ---- Helpers ---------------------------------------------------------------
function makeDeck(numJokers = 1) {
  const deck = [];
  for (const s of SUITS) for (const r of RANKS) deck.push({ suit: s, rank: r, id: `${r}${s}` });
  for (let i = 0; i < numJokers; i++) deck.push({ suit: "🃏", rank: "Joker", id: `Joker${i}` });
  return deck;
}
function shuffle(a) {
  const d = a.slice();
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

// phase: "start" (show back) | "play" (show faces) | "end" (show back + congrats)
export default function App() {
  const [tab, setTab] = useState("workout");

  // Settings (persisted)
  const [exMap, setExMap] = useState(() => JSON.parse(localStorage.getItem("exMap")||"null") || DEFAULT_EXERCISES);
  const [valMap, setValMap] = useState(() => JSON.parse(localStorage.getItem("valMap")||"null") || DEFAULT_VALUE_MAP);
  const [difficulty, setDifficulty] = useState(() => Number(localStorage.getItem("difficulty")) || 1);
  const [jokerCount, setJokerCount] = useState(() => {
    const n = Number(localStorage.getItem("jokerCount"));
    return Number.isFinite(n) ? n : 1; // default 1 joker
  });
  const [jokerExercise, setJokerExercise] = useState(() => localStorage.getItem("jokerExercise") || "Wildcard workout!");

  useEffect(() => localStorage.setItem("exMap", JSON.stringify(exMap)), [exMap]);
  useEffect(() => localStorage.setItem("valMap", JSON.stringify(valMap)), [valMap]);
  useEffect(() => localStorage.setItem("difficulty", String(difficulty)), [difficulty]);
  useEffect(() => localStorage.setItem("jokerCount", String(jokerCount)), [jokerCount]);
  useEffect(() => localStorage.setItem("jokerExercise", jokerExercise), [jokerExercise]);

  // Deck + phase
  const [deck, setDeck] = useState(() => shuffle(makeDeck(jokerCount)));
  const [current, setCurrent] = useState(null);
  const [phase, setPhase] = useState("start"); // "start" | "play" | "end"

  // If jokerCount changes, reset to a fresh deck and go back to start screen
  useEffect(() => {
    setDeck(shuffle(makeDeck(jokerCount)));
    setCurrent(null);
    setPhase("start");
  }, [jokerCount]);

  function repsFor(card) {
    if (!card || card.rank === "Joker") return 0;
    const base = valMap[card.rank] ?? 0;
    return Math.max(1, Math.round(base * difficulty));
  }

  // Draw the next card; if none remain, show end screen
  function drawNext() {
    if (deck.length === 0) {
      setPhase("end");
      setCurrent(null);
      return;
    }
    const next = deck[0];
    setDeck((d) => d.slice(1));
    setCurrent(next);
    setPhase("play");
  }

  // Start from the start screen (back image)
  function startWorkout() {
    if (phase === "start") drawNext();
  }
  // Restart after finishing the deck
  function restartWorkout() {
    setDeck(shuffle(makeDeck(jokerCount)));
    setCurrent(null);
    setPhase("start");
  }

  // ---- UI ------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col">
      {/* Tabs */}
      <header className="flex justify-around bg-blue-600 text-white py-3 text-lg font-semibold">
        <button
          className={`${tab === "workout" ? "border-b-2 border-white" : "opacity-75"}`}
          onClick={() => setTab("workout")}
        >
          Workout
        </button>
        <button
          className={`${tab === "settings" ? "border-b-2 border-white" : "opacity-75"}`}
          onClick={() => setTab("settings")}
        >
          Settings
        </button>
      </header>

      {/* WORKOUT TAB */}
      {tab === "workout" && (
        <main className="flex-1 flex flex-col items-center justify-center p-4">

          {/* Start screen and End screen use the patriotic back image */}
          {(phase === "start" || phase === "end") && (
            <div className="flex flex-col items-center">
              <img
                src={patrioticBack}
                alt="Card back"
                // Fit nicely on any screen: width up to ~88vw, height up to ~80vh, keep aspect
                className="max-h-[80vh] max-w-[88vw] w-auto h-auto rounded-2xl shadow-xl cursor-pointer select-none"
                onClick={phase === "start" ? startWorkout : restartWorkout}
              />
              <div className="mt-4 text-slate-700 font-medium text-center">
                {phase === "start"
                  ? "Flip the card to commence the suffering"
                  : "Congrats, you crushed the workout!"}
              </div>
              {phase === "end" && (
                <button
                  onClick={restartWorkout}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                >
                  Restart
                </button>
              )}
            </div>
          )}

          {/* Playing: always show a FACE card and tapping advances to NEXT card */}
          {phase === "play" && current && (
            <div className="flex flex-col items-center" onClick={drawNext}>
              <CardFlip
                // CardFlip will render a FACE (not the back) and animate a quick flip/fade
                card={current}
                reps={repsFor(current)}
                exercise={
                  current.rank === "Joker"
                    ? jokerExercise
                    : exMap[current.suit] || ""
                }
                patrioticJoker={patrioticJoker}
              />
              {/* Joker text appears below the Joker image per your spec */}
              {current.rank === "Joker" && (
                <div className="mt-3 text-slate-800 font-medium text-center">
                  {jokerExercise}
                </div>
              )}
              <div className="mt-3 text-slate-600 text-sm">(Tap card for next)</div>
            </div>
          )}
        </main>
      )}

      {/* SETTINGS TAB */}
      {tab === "settings" && (
        <main className="flex-1 p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-2xl mt-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Workout Settings</h2>

          {/* Suit → Exercise */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-slate-700">Suit → Exercise</h3>
            <div className="grid grid-cols-2 gap-3">
              {SUITS.map((s) => (
                <div key={s} className="flex flex-col items-center">
                  <div className="text-3xl">{s}</div>
                  <input
                    value={exMap[s]}
                    onChange={(e) => setExMap((m) => ({ ...m, [s]: e.target.value }))}
                    className="p-2 mt-1 border rounded w-full text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Jokers */}
          <div className="mb-6">
            <label className="block font-semibold text-slate-700 mb-1">Number of Jokers</label>
            <select
              value={jokerCount}
              onChange={(e) => setJokerCount(Number(e.target.value))}
              className="p-2 border rounded w-full"
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
            <label className="block mt-3 font-semibold text-slate-700 mb-1">
              Joker Workout
            </label>
            <input
              value={jokerExercise}
              onChange={(e) => setJokerExercise(e.target.value)}
              className="p-2 border rounded w-full"
            />
          </div>

          {/* Difficulty */}
          <div className="mb-6">
            <label className="block font-semibold text-slate-700 mb-1">
              Difficulty Multiplier: {difficulty.toFixed(1)}x
            </label>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Value Map */}
          <div>
            <h3 className="font-semibold mb-2 text-slate-700">Card Value Mapping</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(valMap).map(([rank, value]) => (
                <div key={rank} className="flex items-center gap-2 text-sm">
                  <span className="w-6">{rank}</span>
                  <input
                    value={value}
                    onChange={(e) =>
                      setValMap((v) => ({ ...v, [rank]: Number(e.target.value) }))
                    }
                    className="p-1 border rounded w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      <footer className="py-3 text-center text-xs text-slate-500">
        Made with ❤️ — Deck of Cards Workout (Offline PWA)
      </footer>
    </div>
  );
}
