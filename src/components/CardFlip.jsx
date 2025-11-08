import React, { useState } from "react";
import { motion } from "framer-motion";

export default function CardFlip({ card, reps, exercise, patrioticJoker }) {
  const [flipped, setFlipped] = useState(true); // Show face initially (already flipped)

  if (!card) return null;

  const isJoker = card.rank === "Joker";

  const front = (
    <div className="relative w-48 h-64 bg-white rounded-xl border border-slate-300 shadow-xl flex flex-col items-center justify-center">
      {isJoker ? (
        <img
          src={patrioticJoker}
          alt="Joker"
          className="absolute inset-0 w-full h-full object-cover rounded-xl"
        />
      ) : (
        <>
          <div className="absolute top-2 left-2 text-2xl">{card.suit}</div>
          <div className="text-6xl font-bold">{card.rank}</div>
          <div className="absolute bottom-2 right-2 text-2xl rotate-180">
            {card.suit}
          </div>
          <div className="absolute bottom-4 text-center w-full text-slate-700 text-sm">
            {exercise} • {reps} reps
          </div>
        </>
      )}
    </div>
  );

  const back = (
    <div className="w-48 h-64 rounded-xl shadow-xl border border-slate-300 bg-gradient-to-br from-blue-600 to-red-500 flex items-center justify-center text-white text-lg">
      Deck of Cards
    </div>
  );

  return (
    <motion.div
      className="relative cursor-pointer"
      onClick={() => setFlipped(!flipped)}
      initial={false}
      animate={{ rotateY: flipped ? 180 : 0 }}
      transition={{ duration: 0.6 }}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      {/* Back */}
      <motion.div
        className="absolute w-full h-full backface-hidden"
        style={{ backfaceVisibility: "hidden" }}
      >
        {back}
      </motion.div>

      {/* Front */}
      <motion.div
        className="absolute w-full h-full backface-hidden"
        style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
      >
        {front}
      </motion.div>
    </motion.div>
  );
}
