// src/components/Settings.jsx
import React from "react";
import {
  FOCUS_PLACEHOLDER_OPTIONS,
  getAssignmentLabel,
} from "../constants/libraryConfig";

const SUITS = [
  { key: "\u2660", label: "Spades" },
  { key: "\u2665", label: "Hearts" },
  { key: "\u2666", label: "Diamonds" },
  { key: "\u2663", label: "Clubs" },
];

const JOKER_SLOT_OPTIONS = [
  { value: "random", label: 'Random Draw from "Jokers" List' },
  { value: "none", label: "None" },
];

const DEFAULT_SUIT_CHOICES = ["Lunges", "Squats", "Push-ups", "Sit-ups"].map(
  (name) => ({ value: name, label: name })
);

const FALLBACK_SUIT_OPTIONS = [
  ...FOCUS_PLACEHOLDER_OPTIONS,
  ...DEFAULT_SUIT_CHOICES,
];

function ensureSuitOption(options, value) {
  const trimmedValue = typeof value === "string" ? value.trim() : "";
  if (!trimmedValue) return options;
  if (options.some((opt) => opt.value === trimmedValue)) return options;
  const label = getAssignmentLabel(trimmedValue) || trimmedValue;
  return [{ value: trimmedValue, label }, ...options];
}

export default function Settings({
  deckSize,
  setDeckSize,
  aceHigh,
  setAceHigh,
  faceCardMode,
  setFaceCardMode,
  keepScreenAwake,
  setKeepScreenAwake,
  resetDeck,
  deckPresets,
  workoutOptions,
  onDeckSuitChange,
  onDeckJokerChange,
  onDeleteDeck,
  onStartAddCustomDeck,
  customDeckDraft,
  onCustomDeckFieldChange,
  onCustomDeckSuitChange,
  onCustomDeckJokerChange,
  onSaveCustomDeck,
  onCancelCustomDeck,
}) {
  const suitOptions =
    Array.isArray(workoutOptions) && workoutOptions.length
      ? workoutOptions
      : FALLBACK_SUIT_OPTIONS;

  const renderDeckSection = (deck) => (
    <div
      key={deck.id}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: "#ffffff" }}>
          {deck.name}
        </h3>
        {deck.id !== "standard" && (
          <button
            type="button"
            onClick={() => onDeleteDeck?.(deck.id)}
            className="px-3 py-1 text-xs font-semibold border border-white/30 rounded-lg text-white hover:bg-white/10"
          >
            Delete
          </button>
        )}
      </div>
      {SUITS.map((suit) => {
        const currentValue = deck.suits?.[suit.key] || "";
        const optionsForSuit = ensureSuitOption(suitOptions, currentValue);
        return (
          <div
            key={`${deck.id}-${suit.key}`}
            className="flex items-center gap-2"
          >
            <span className="w-24 text-right text-white/80">{suit.label}</span>
            <select
              className="flex-1 border p-2 rounded bg-white text-black"
              value={currentValue}
              onChange={(e) =>
                onDeckSuitChange(deck.id, suit.key, e.target.value)
              }
            >
              {optionsForSuit.map((opt) => (
                <option
                  key={`${deck.id}-${suit.key}-${opt.value}`}
                  value={opt.value}
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );
      })}
      <div className="flex flex-col gap-3 mt-2">
        {[1, 2].map((slot) => {
          const slotValue =
            deck.jokerSlots &&
            (deck.jokerSlots[slot] || deck.jokerSlots[String(slot)])
              ? deck.jokerSlots[slot] || deck.jokerSlots[String(slot)]
              : "none";
          return (
            <React.Fragment key={`${deck.id}-joker-${slot}`}>
              <div className="flex items-center gap-3">
                <span className="w-32 text-right text-white font-semibold">
                  {`Joker #${slot}`}
                </span>
                <select
                  className="flex-1 border p-2 rounded bg-white text-black"
                  value={slotValue}
                  onChange={(e) =>
                    onDeckJokerChange(deck.id, slot, e.target.value)
                  }
                >
                  {JOKER_SLOT_OPTIONS.map((opt) => (
                    <option
                      key={`${deck.id}-joker-${slot}-${opt.value}`}
                      value={opt.value}
                    >
                      {opt.label}
                    </option>
                ))}
              </select>
            </div>
              {slot === 2 && <div style={{ height: 24 }} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const renderCustomDeckForm = () => {
    if (!customDeckDraft) return null;
    return (
      <div className="rounded-2xl border border-white/20 bg-white/10 p-4 space-y-3 mt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: "#ffffff" }}>
            New Custom Workout
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-24 text-right text-white/80">Name</span>
          <input
            className="flex-1 border p-2 rounded bg-white text-black"
            value={customDeckDraft.name}
            onChange={(e) => onCustomDeckFieldChange("name", e.target.value)}
            placeholder="Name your workout"
          />
        </div>
        {SUITS.map((suit) => {
          const currentValue = customDeckDraft.suits?.[suit.key] || "";
          const optionsForSuit = ensureSuitOption(suitOptions, currentValue);
          return (
            <div key={`custom-${suit.key}`} className="flex items-center gap-2">
              <span className="w-24 text-right text-white/80">
                {suit.label}
              </span>
              <select
                className="flex-1 border p-2 rounded bg-white text-black"
                value={currentValue}
                onChange={(e) =>
                  onCustomDeckSuitChange(suit.key, e.target.value)
                }
              >
                {optionsForSuit.map((opt) => (
                  <option
                    key={`custom-${suit.key}-${opt.value}`}
                    value={opt.value}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
        <div className="flex flex-col gap-3 mt-2">
          {[1, 2].map((slot) => {
            const slotValue =
              customDeckDraft.jokerSlots &&
              (customDeckDraft.jokerSlots[slot] ||
                customDeckDraft.jokerSlots[String(slot)])
                ? customDeckDraft.jokerSlots[slot] ||
                  customDeckDraft.jokerSlots[String(slot)]
                : "none";
            return (
              <React.Fragment key={`custom-joker-${slot}`}>
                <div className="flex items-center gap-3">
                  <span className="w-32 text-right text-white font-semibold">
                    {`Joker #${slot}`}
                  </span>
                  <select
                    className="flex-1 border p-2 rounded bg-white text-black"
                    value={slotValue}
                    onChange={(e) =>
                      onCustomDeckJokerChange(slot, e.target.value)
                    }
                >
                  {JOKER_SLOT_OPTIONS.map((opt) => (
                    <option
                      key={`custom-joker-${slot}-${opt.value}`}
                      value={opt.value}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
                {slot === 2 && <div style={{ height: 24 }} />}
              </React.Fragment>
            );
          })}
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onSaveCustomDeck}
            className="px-4 py-2 bg-blue-600 rounded-lg text-white text-sm font-semibold hover:bg-blue-500"
          >
            Save Workout
          </button>
          <button
            type="button"
            onClick={onCancelCustomDeck}
            className="px-4 py-2 bg-transparent border border-white/40 rounded-lg text-sm font-semibold hover:bg-white/10"
            style={{ color: "#ffffff" }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col items-stretch max-w-md w-full p-6 bg-white/5 rounded-xl border border-white/10 text-white"
      style={{ color: "#ffffff" }}
    >
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <button
          type="button"
          onClick={resetDeck}
          className="px-3 py-2 bg-blue-600 rounded-lg text-white text-sm font-semibold hover:bg-blue-500"
        >
          Reset Deck
        </button>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-32 text-right text-white font-semibold">
            Deck Size
          </span>
          <select
            className="flex-1 border p-2 rounded bg-white text-black"
            value={deckSize}
            onChange={(e) => setDeckSize(e.target.value)}
          >
            <option value="quarter">Quarter</option>
            <option value="half">Half</option>
            <option value="threequarters">Three Quarters</option>
            <option value="full">Full</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-32 text-right text-white font-semibold">
            Ace Value (reps)
          </span>
          <select
            className="flex-1 border p-2 rounded bg-white text-black"
            value={aceHigh ? "14" : "1"}
            onChange={(e) => setAceHigh(e.target.value === "14")}
          >
            <option value="1">Ace = 1</option>
            <option value="14">Ace = 14</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-32 text-right text-white font-semibold">
            Face Card Value
          </span>
          <select
            className="flex-1 border p-2 rounded bg-white text-black"
            value={faceCardMode}
            onChange={(e) => setFaceCardMode(e.target.value)}
          >
            <option value="ten">J/Q/K = 10</option>
            <option value="progressive">J/Q/K = 11/12/13</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-32 text-right text-white font-semibold">
            Keep Screen Awake
          </span>
          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="checkbox"
              className="h-5 w-5 accent-blue-500"
              checked={!!keepScreenAwake}
              onChange={(e) => setKeepScreenAwake(e.target.checked)}
            />
            <span>Prevent the display from sleeping</span>
          </label>
        </div>
      </div>
      <div style={{ height: 24 }} />

      <div className="space-y-4">
        {deckPresets.map((deck) => renderDeckSection(deck))}
      </div>
      <div>
        <button
          type="button"
          onClick={onStartAddCustomDeck}
          className="w-full px-4 py-2 bg-blue-600 rounded-lg text-white text-sm font-semibold hover:bg-blue-500"
        >
          Add Custom Workout
        </button>
      </div>
      {renderCustomDeckForm()}
    </div>
  );
}
