import React from "react";

export default function CardFace({ card, exercise, reps }) {
  if (!card) return null;

  const isRed = card.suit === "♦" || card.suit === "♥";
  const textColor = isRed ? "text-red-600" : "text-black";

  // Joker card
  if (card.rank === "Joker") {
    return (
      <div className="flex flex-col items-center">
        <img
          src={`${import.meta.env.BASE_URL}patriotic-joker.png`}
          alt="Joker"
          className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl"
        />
        {exercise && (
          <p className="mt-4 text-lg font-semibold text-gray-900 text-center">
            {exercise}
          </p>
        )}
      </div>
    );
  }

  // Standard card face
  return (
    <div className="relative bg-white rounded-2xl border-[3px] border-gray-400 shadow-2xl w-[280px] h-[400px] flex flex-col justify-between p-3 overflow-hidden">
      {/* Top left corner */}
      <div className={`absolute top-3 left-3 text-2xl font-bold ${textColor}`}>
        {card.rank}
        <div>{card.suit}</div>
      </div>

      {/* Center suit */}
      <div className={`flex items-center justify-center text-8xl ${textColor}`}>
        {card.suit}
      </div>

      {/* Bottom right corner (mirrored) */}
      <div className={`absolute bottom-3 right-3 text-2xl font-bold rotate-180 ${textColor}`}>
        {card.rank}
        <div>{card.suit}</div>
      </div>

      {/* Exercise & reps */}
      <div className="absolute bottom-2 inset-x-0 text-center text-sm text-gray-700 font-medium">
        {exercise} — {reps} reps
      </div>
    </div>
  );
}
