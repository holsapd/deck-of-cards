// src/components/Settings.jsx
import React from "react";

const SUITS = [
  { key: "\u2660", label: "Spades" },
  { key: "\u2665", label: "Hearts" },
  { key: "\u2666", label: "Diamonds" },
  { key: "\u2663", label: "Clubs" },
];

export default function Settings({
  numJokers,
  setNumJokers,
  exMap,
  setExMap,
  jokerWorkouts,
  setJokerWorkouts,
  difficulty,
  setDifficulty,
  aceHigh,
  setAceHigh,
}) {
  const updateExercise = (suit, value) => {
    setExMap((prev) => ({ ...prev, [suit]: value }));
  };
  const addJokerExercise = () => {
    setJokerWorkouts((prev) => [...prev, ""]);
  };
  const updateJokerExercise = (idx, value) => {
    setJokerWorkouts((prev) => prev.map((v, i) => (i === idx ? value : v)));
  };
  const removeJokerExercise = (idx) => {
    setJokerWorkouts((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div
      className="flex flex-col items-stretch max-w-md w-full p-6 bg-white/5 rounded-xl border border-white/10 text-white"
      style={{ color: "#ffffff" }}
    >
      <h2 className="text-2xl font-bold mb-4 text-white">Settings</h2>

      {/* Exercises by Suit (first) */}
      <div className="mb-2 font-semibold text-white">Exercises by Suit</div>
      <div className="grid grid-cols-1 gap-3">
        {SUITS.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="w-24 text-right text-white/80">{s.label}</span>
            <input
              className="flex-1 border p-2 rounded bg-white text-black"
              value={exMap[s.key] || ""}
              onChange={(e) => updateExercise(s.key, e.target.value)}
              placeholder={`Workout for ${s.label}`}
            />
          </div>
        ))}
      </div>

      {/* Space then Difficulty Multiplier */}
      <div style={{ height: 24 }} />
      <label className="mb-2 font-semibold text-white">
        Difficulty Multiplier
      </label>
      <select
        className="border p-2 rounded bg-white text-black mb-4"
        value={difficulty}
        onChange={(e) => setDifficulty(Number(e.target.value))}
      >
        <option value={0.5}>0.5x</option>
        <option value={1}>1x (Normal)</option>
        <option value={1.5}>1.5x</option>
        <option value={2}>2x</option>
      </select>

      {/* Space then Ace value and Number of Jokers */}
      <div style={{ height: 24 }} />
      <label className="mb-2 font-semibold text-white">Ace Value (reps)</label>
      <select
        className="border p-2 rounded bg-white text-black mb-4"
        value={aceHigh ? '14' : '1'}
        onChange={(e) => setAceHigh(e.target.value === '14')}
      >
        <option value="1">Ace = 1</option>
        <option value="14">Ace = 14</option>
      </select>

      <label className="mb-2 font-semibold text-white">Number of Jokers</label>
      <select
        className="border p-2 rounded bg-white text-black mb-4"
        value={numJokers}
        onChange={(e) => setNumJokers(Number(e.target.value))}
      >
        {Array.from({ length: 11 }, (_, i) => (
          <option key={i} value={i}>
            {i} {i === 1 ? "Joker" : "Jokers"}
          </option>
        ))}
      </select>

      {/* Space then Joker workouts list */}
      <div style={{ height: 24 }} />
      <div className="mb-2 font-semibold text-white">
        Joker Workouts
      </div>
      <div className="flex flex-col gap-2 mb-3">
        {jokerWorkouts.map((jw, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              className="flex-1 border p-2 rounded bg-white text-black"
              value={jw}
              onChange={(e) => updateJokerExercise(idx, e.target.value)}
              placeholder={`Joker exercise #${idx + 1}`}
            />
            <button
              type="button"
              className="px-2 py-1 bg-red-600 text-white rounded"
              onClick={() => removeJokerExercise(idx)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="self-start px-3 py-2 bg-blue-600 text-white rounded"
          onClick={addJokerExercise}
          
        >
          Add Joker Exercise
        </button>
      </div>
    </div>
  );
}



