import React from "react";
import { motion } from "framer-motion";

export default function CardFlip({ card, reps, exercise, patrioticJoker }) {
  if (!card) return null;

  const isJoker = card.rank === "Joker";
  const isRed = card.suit === "♥" || card.suit === "♦";

  return (
    <motion.div
      key={card.id}
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: -180, opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className="relative flex items-center justify-center"
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
    >
      {/* Joker fills screen proportionally */}
      {isJoker ? (
        <img
          src={patrioticJoker}
          alt="Joker Card"
          className="rounded-2xl shadow-2xl select-none"
          style={{
            maxWidth: "88vw",
            maxHeight: "70vh",
            width: "auto",
            height: "auto",
            objectFit: "contain",
          }}
        />
      ) : (
        // Standard card face (white card with real layout)
        <div
          className="relative bg-white rounded-2xl border border-slate-400 shadow-2xl overflow-hidden"
          style={{
            // robust sizing on all devices
            maxWidth: "88vw",
            maxHeight: "70vh",
            width: 350,          // target width on normal phones
            aspectRatio: "2 / 3" // keeps proper card ratio without plugins
          }}
        >
          {/* Top-left corner */}
          <div className="absolute top-2 left-3 leading-tight select-none">
            <div className={`text-2xl font-bold ${isRed ? "text-red-600" : "text-black"}`}>
              {card.rank}
            </div>
            <div className={`text-xl ${isRed ? "text-red-600" : "text-black"}`}>{card.suit}</div>
          </div>

          {/* Center suit */}
          <div className="absolute inset-0 flex items-center justify-center select-none">
            <span className={`${isRed ? "text-red-500" : "text-black"}`} style={{ fontSize: "6rem", lineHeight: 1 }}>
              {card.suit}
            </span>
          </div>

          {/* Bottom-right corner (rotated) */}
          <div className="absolute bottom-2 right-3 leading-tight rotate-180 select-none">
            <div className={`text-2xl font-bold ${isRed ? "text-red-600" : "text-black"}`}>
              {card.rank}
            </div>
            <div className={`text-xl ${isRed ? "text-red-600" : "text-black"}`}>{card.suit}</div>
          </div>

          {/* Exercise + reps at bottom center */}
          <div className="absolute bottom-4 left-0 w-full text-center text-base font-medium text-slate-700 select-none">
            {exercise} — {reps} {reps === 1 ? "rep" : "reps"}
          </div>
        </div>
      )}
    </motion.div>
  );
}
