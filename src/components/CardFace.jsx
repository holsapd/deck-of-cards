import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const patrioticBack = `${import.meta.env.BASE_URL}patriotic-playing-card.png`;
const jokerImg = `${import.meta.env.BASE_URL}patriotic-joker.png`;

export default function CardFace({ card, reps, workout, showBack }) {
  if (showBack) {
    return (
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, rotateY: -90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        exit={{ opacity: 0, rotateY: 90 }}
        transition={{ duration: 0.3 }}
      >
        <img
          src={patrioticBack}
          alt="Card Back"
          className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl"
        />
      </motion.div>
    );
  }

  if (!card) return null;

  const isJoker = card.suit === "🃏";
  const isRed = card.suit === "♦" || card.suit === "♥";
  const pipColor = isRed ? "text-red-600" : "text-black";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={card.id}
        initial={{ rotateY: -90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: 90, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center"
      >
        {isJoker ? (
          <>
            <img
              src={jokerImg}
              alt="Joker"
              className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl"
            />
            {workout && (
              <p className="mt-4 text-lg font-semibold text-gray-100">
                {workout}
              </p>
            )}
          </>
        ) : (
          <div
            className="relative bg-white rounded-2xl border-[3px] border-gray-300 shadow-2xl overflow-hidden"
            style={{
              width: "min(88vw, 320px)",
              aspectRatio: "2.5 / 3.5",
              fontFamily:
                "'Old Standard TT', 'Playfair Display', Georgia, serif",
              backgroundColor: "#ffffff", // force white when utilities aren't applied
              zIndex: 10,
            }}
          >
            {/* Top-left corner */}
            <div
              className={`${pipColor} text-sm font-semibold text-center leading-tight`}
              style={{ position: "absolute", top: 12, left: 12, lineHeight: 1 }}
            >
              <div style={{ lineHeight: 1 }}>{card.rank}</div>
              <div style={{ fontSize: 18, lineHeight: 1 }}>{card.suit}</div>
            </div>

            {/* Bottom-right corner */}
            <div
              className={`${pipColor} text-sm font-semibold text-center leading-tight`}
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                transform: "rotate(180deg)",
                lineHeight: 1,
              }}
            >
              <div style={{ lineHeight: 1 }}>{card.rank}</div>
              <div style={{ fontSize: 18, lineHeight: 1 }}>{card.suit}</div>
            </div>

            {/* Center artwork / workout */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                textAlign: "center",
              }}
            >
              {/[JQK]/.test(card.rank) ? (
                <div
                  className={`${pipColor} select-none mb-2`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: 40, fontWeight: 800 }}>
                    {card.rank}
                  </div>
                  <div style={{ fontSize: 40, marginTop: 6 }}>{card.suit}</div>
                </div>
              ) : (
                <div
                  className={`${pipColor} select-none mb-2`}
                  style={{ fontSize: 40 }}
                >
                  {card.suit}
                </div>
              )}

              <div
                style={{
                  color: "#111827",
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                {workout}
              </div>
              <div style={{ color: "#374151", fontSize: 18 }}>
                {reps} {reps === 1 ? "rep" : "reps"}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
