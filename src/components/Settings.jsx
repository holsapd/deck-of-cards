// src/components/Settings.jsx
import React from "react";

export default function Settings({ numJokers, setNumJokers }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <label className="mb-2 font-semibold">Number of Jokers:</label>
      <select
        className="border p-2 rounded"
        value={numJokers}
        onChange={(e) => setNumJokers(Number(e.target.value))}
      >
        <option value={0}>0 Jokers</option>
        <option value={1}>1 Joker</option>
        <option value={2}>2 Jokers</option>
      </select>
    </div>
  );
}
