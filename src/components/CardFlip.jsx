import React from "react";
import { motion } from "framer-motion";

export default function CardFlip({ card, reps, exercise, patrioticJoker }) {
  if (!card) return null;

  const isJoker = card.rank === "Joker";

  return (
    <motion.div
      key={card.id}
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: -180, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="relative flex items-center justify-center"
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Joker Card */}
      {isJoker ? (
        <img
          src={patrioticJoker}
          alt="Joker Card"
          className="max-h-[70vh] max-w-[88vw] w-auto h-auto object-contain rounded-2xl shadow-xl select-none"
        />
      ) : (
        // Standard Card Face
        <div className="relative bg-white rounded-2xl border border-slate-400 shadow-2xl aspect-[2/3] w-[min(80vw,350px)] h-auto flex flex-col justify-between p-4 text-slate-900">
          {/* Top corner */}
          <div className="absolute top-2 left-3 text-left leading-tight">
            <div
              className={`text-2xl font-bold ${
                card.suit === "♥" || card.suit === "♦"
                  ? "text-red-600"
                  : "text-black"
              }`}
            >
              {card.rank}
            </div>
            <div className="text-xl">{card.suit}</div>
          </div>

          {/* Center suit */}
          <div className="flex-1 flex items-center justify-center text-[6rem] select-none">
            <span
              className={`${
                card.suit === "♥" || card.suit === "♦"
                  ? "text-red-500"
                  : "text-black"
              }`}
            >
              {card.suit}
            </span>
          </div>

          {/* Bottom corner */}
          <div className="absolute bottom-2 right-3 text-right leading-tight rotate-180">
            <div
              className={`text-2xl font-bold ${
                card.suit === "♥" || card.suit === "♦"
                  ? "text-red-600"
                  : "text-black"
              }`}
            >
              {card.rank}
            </div>
            <div className="text-xl">{card.suit}</div>
          </div>

          {/* Exercise text */}
          <div className="absolute bottom-4 left-0 w-full text-center text-base font-medium text-slate-700">
            {exercise} — {reps} reps
          </div>
        </div>
      )}
    </motion.div>
  );
}
