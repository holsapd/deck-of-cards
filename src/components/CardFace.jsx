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
          src="/patriotic-joker.png"
          alt="Joker"
          className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl"
        />
        {exercise && (
          <p className="mt-4 text-lg font-medium text-gray-900 text-center">
            {exercise}
          </p>
        )}
      </div>
    );
  }

  // Standard card face
  return (
    <div className="bg-white rounded-2xl border-4 border-gray-300 shadow-2xl w-[250px] h-[360px] flex flex-col justify-between p-4 relative">
      <div className={`text-2xl font-bold ${textColor}`}>
        {card.rank}
        <div>{card.suit}</div>
      </div>

      <div className={`text-7xl ${textColor} text-center`}>
        {card.suit}
      </div>

      <div className={`text-2xl font-bold self-end rotate-180 ${textColor}`}>
        {card.rank}
        <div>{card.suit}</div>
      </div>

      <div className="absolute inset-x-0 bottom-3 text-center text-sm text-gray-700">
        {exercise} — {reps} reps
      </div>
    </div>
  );
}
