import React from "react";

export default function CardFace({ card, exercise, reps }) {
  if (!card) return null;

  const isRed = card.suit === "♦" || card.suit === "♥";
  const textColor = isRed ? "text-red-600" : "text-black";

  // Joker card uses image
  if (card.rank === "Joker") {
    return (
      <div className="flex flex-col items-center">
        <img
          src="/src/assets/patriotic-joker.png"
          alt="Joker"
          className="max-h-[80vh] w-auto object-contain rounded-lg shadow-lg"
        />
        {exercise && (
          <p className="mt-4 text-lg font-medium text-gray-900">{exercise}</p>
        )}
      </div>
    );
  }

  // Standard card face
  return (
    <div className="relative bg-white rounded-xl border-2 border-gray-300 shadow-xl w-64 h-96 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out">
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

      <div className="absolute inset-x-0 bottom-4 text-center text-lg font-medium text-gray-900">
        {exercise} — {reps} reps
      </div>
    </div>
  );
}
