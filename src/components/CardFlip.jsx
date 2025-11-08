// src/components/CardFlip.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import cardBack from "../assets/patriotic-playing-card.png";
import jokerCard from "../assets/patriotic-joker.png";

export default function CardFlip({ card, repsText }) {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    setFlipped((f) => !f);
  };

  const isJoker = card?.rank === "Joker";

  return (
    <div className="flex justify-center items-center h-80 cursor-pointer" onClick={handleFlip}>
      <AnimatePresence initial={false}>
        <motion.div
          key={flipped ? "front" : "back"}
          initial={{ rotateY: flipped ? 180 : -180 }}
          animate={{ rotateY: 0 }}
          exit={{ rotateY: flipped ? 180 : -180 }}
          transition={{ duration: 0.8 }}
          className="w-56 h-80 rounded-2xl shadow-xl bg-white"
          style={{ perspective: "1000px" }}
        >
          <img
            src={flipped ? (isJoker ? jokerCard : cardBack) : cardBack}
            alt="Card"
            className="w-full h-full object-cover rounded-2xl"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
