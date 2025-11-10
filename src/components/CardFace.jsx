import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const patrioticBack = `${import.meta.env.BASE_URL}patriotic-playing-card.png`;
const jokerImg = `${import.meta.env.BASE_URL}patriotic-joker.png`;
const hellYeahImg = `${import.meta.env.BASE_URL}hell-yeah-brother.png`;
const hellYeahAudio = `${import.meta.env.BASE_URL}hell-yeah-brother.m4a`;
const queenExample = `${import.meta.env.BASE_URL}patriotic-queen-example.png`;
const faceArt = {
  J: `${import.meta.env.BASE_URL}patriotic-jack.png`,
  Q: `${import.meta.env.BASE_URL}patriotic-queen.png`,
  K: `${import.meta.env.BASE_URL}busch-king.png`,
};

export default function CardFace({ card, reps, workout, showBack }) {
  // Track face-art source and allow fallback to queen example
  const [faceSrc, setFaceSrc] = React.useState(null);
  React.useEffect(() => {
    if (card && /[JQK]/.test(card.rank)) {
      const preferred = faceArt[card.rank] || queenExample;
      setFaceSrc(preferred);
    } else {
      setFaceSrc(null);
    }
  }, [card?.id]);
  const isEndCard = card?.id === "end";

  // Play celebratory audio when the end card is shown
  React.useEffect(() => {
    if (showBack && isEndCard) {
      try {
        const audio = new Audio(hellYeahAudio);
        audio.play().catch(() => {});
      } catch {}
    }
  }, [showBack, isEndCard]);
  if (showBack) {
    return (
      <motion.div
        className="flex flex-col items-center"
        initial={
          isEndCard ? { opacity: 0, rotate: 0 } : { opacity: 0, rotateY: -90 }
        }
        animate={
          isEndCard
            ? { opacity: 1, rotate: 360 * 5 }
            : { opacity: 1, rotateY: 0 }
        }
        exit={isEndCard ? { opacity: 0 } : { opacity: 0, rotateY: 90 }}
        transition={
          isEndCard ? { duration: 1.6, ease: "linear" } : { duration: 0.3 }
        }
      >
        <img
          src={isEndCard ? hellYeahImg : patrioticBack}
          alt={isEndCard ? "Workout Complete" : "Card Back"}
          className="max-h-[75vh] w-auto object-contain rounded-[24px] shadow-2xl"
        />
      </motion.div>
    );
  }

  const isJoker = card.suit === "🃏";
  const isRed = card.suit === "♦" || card.suit === "♥";
  const pipColor = isRed ? "text-red-600" : "text-black";
  // Fallback-safe suit/color logic (avoids encoding issues)
  const isJokerFixed = card?.rank === "Joker";
  const isRedFixed = card?.suit === "♥" || card?.suit === "♦";
  const isRedFinal = card?.isRed ?? isRedFixed;
  const pipColorFixed = isRedFinal ? "text-red-600" : "text-black";
  const textColor = isRedFinal ? "#dc2626" : "#000000";

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
        {isJokerFixed ? (
          <div
            className="relative bg-white rounded-[24px] border-[3px] border-gray-300 shadow-2xl overflow-hidden"
            style={{
              width: "min(88vw, 320px)",
              aspectRatio: "2.5 / 3.5",
              fontFamily:
                "'Old Standard TT', 'Playfair Display', Georgia, serif",
              backgroundColor: "#ffffff",
              zIndex: 10,
            }}
          >
            <img
              src={jokerImg}
              alt="Joker artwork"
              className="absolute inset-0 w-full h-full object-cover select-none"
              style={{ pointerEvents: "none" }}
            />

            {/* Center overlay for Joker workout (no reps) */}
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
              <div
                style={{
                  backgroundColor: "rgba(245,245,244,0.85)",
                  color: "#111827",
                  padding: "12px 16px",
                  borderRadius: 14,
                  minWidth: "65%",
                  fontSize: 24,
                  fontWeight: 700,
                  transform: "translateY(50px)",
                }}
              >
                {workout}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="relative bg-white rounded-[24px] border-[3px] border-gray-300 shadow-2xl overflow-hidden"
            style={{
              width: "min(88vw, 320px)",
              aspectRatio: "2.5 / 3.5",
              fontFamily:
                "'Old Standard TT', 'Playfair Display', Georgia, serif",
              backgroundColor: "#ffffff", // force white when utilities aren't applied
              zIndex: 10,
            }}
          >
            {/[JQK]/.test(card.rank) && faceSrc && (
              <img
                src={faceSrc}
                alt={`${card.rank} artwork`}
                onError={() => {
                  if (faceSrc !== queenExample) setFaceSrc(queenExample);
                }}
                className="absolute inset-0 w-full h-full object-cover select-none"
                style={{ pointerEvents: "none" }}
              />
            )}
            {/* Top-left corner */}
            <div
              className={`${pipColorFixed} font-semibold text-center leading-tight`}
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                lineHeight: 1,
                color: textColor,
              }}
            >
              <div style={{ lineHeight: 1, fontSize: 37 }}>{card.rank}</div>
              <div style={{ lineHeight: 1, fontSize: 45 }}>{card.suit}</div>
            </div>

            {/* Bottom-right corner */}
            <div
              className={`${pipColorFixed} font-semibold text-center leading-tight`}
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                transform: "rotate(180deg)",
                lineHeight: 1,
                color: textColor,
              }}
            >
              <div style={{ lineHeight: 1, fontSize: 37 }}>{card.rank}</div>
              <div style={{ lineHeight: 1, fontSize: 45 }}>{card.suit}</div>
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
                  className="select-none mb-2"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transform: "translateY(50px)",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "rgba(245,245,244,0.85)",
                      color: "#111827",
                      padding: "12px 16px",
                      borderRadius: 14,
                      minWidth: "65%",
                    }}
                  >
                    <div
                      style={{
                        color: "#111827",
                        fontSize: 24,
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      {workout}
                    </div>
                    <div style={{ color: "#111827", fontSize: 20 }}>
                      {reps} {reps === 1 ? "rep" : "reps"}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`${pipColorFixed} select-none mb-2`}
                  style={{ fontSize: 80, color: textColor }}
                >
                  {card.suit}
                </div>
              )}

              {!(isJokerFixed || /[JQK]/.test(card.rank)) && (
                <>
                  <div
                    style={{
                      color: "#111827",
                      fontSize: 25,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    {workout}
                  </div>
                  <div style={{ color: "#374151", fontSize: 25 }}>
                    {reps} {reps === 1 ? "rep" : "reps"}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

