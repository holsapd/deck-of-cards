// src/components/Card.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import cardBack from "../assets/patriotic-playing-card.png";
import jokerCard from "../assets/patriotic-joker.png";

export default function Card({ card, onFlip }) {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    setFlipped(!flipped);
    onFlip?.();
  };

  return (
    <div
      className="flex justify-center items-center h-[70vh]"
      onClick={handleFlip}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={flipped ? "front" : "back"}
          initial={{ rotateY: flipped ? 180 : -180 }}
          animate={{ rotateY: 0 }}
          exit={{ rotateY: flipped ? 180 : -180 }}
          transition={{ duration: 0.8 }}
          className="w-64 h-96 rounded-2xl shadow-lg bg-white cursor-pointer"
          style={{ perspective: "1000px" }}
        >
          <img
            src={flipped ? (card.isJoker ? jokerCard : card.image) : cardBack}
            alt="Card"
            className="w-full h-full object-cover rounded-2xl"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
