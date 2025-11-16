import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const standardBack = `${
  import.meta.env.BASE_URL
}theme-standard-playing-card.png`;
const jokerImg = `${import.meta.env.BASE_URL}theme-standard-joker.png`;
const celebrationImg = `${
  import.meta.env.BASE_URL
}theme-standard-celebration.png`;
const hellYeahAudio = `${import.meta.env.BASE_URL}hell-yeah-brother.m4a`;
const queenExample = `${import.meta.env.BASE_URL}theme-standard-queen.png`;
const faceArt = {
  J: `${import.meta.env.BASE_URL}theme-standard-jack.png`,
  Q: `${import.meta.env.BASE_URL}theme-standard-queen.png`,
  K: `${import.meta.env.BASE_URL}theme-standard-king.png`,
};
// Shared sizing keeps front/back cards consistent regardless of asset proportions
const cardFrameStyle = {
  width: "100%",
  maxWidth: "720px",
  aspectRatio: "2.5 / 3.5",
  fontFamily: "'Old Standard TT', 'Playfair Display', Georgia, serif",
  backgroundColor: "#ffffff",
  zIndex: 10,
};

export default function CardFace({
  card,
  reps,
  workout,
  showBack,
  preWorkoutOverlay,
}) {
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
  const showPreWorkoutOverlay =
    showBack && !!preWorkoutOverlay && !isEndCard && !card;

  if (showBack) {
    return (
      <motion.div
        className="flex flex-col items-center w-full"
        initial={
          isEndCard
            ? { opacity: 0, y: -120, rotate: 0, scale: 0.9 }
            : { opacity: 0, rotateY: -90 }
        }
        animate={
          isEndCard
            ? { opacity: 1, y: 0, rotate: 360, scale: 1 }
            : { opacity: 1, rotateY: 0 }
        }
        exit={isEndCard ? { opacity: 0 } : { opacity: 0, rotateY: 90 }}
        transition={
          isEndCard
            ? { type: "spring", stiffness: 60, damping: 16 }
            : { duration: 0.3 }
        }
      >
        <div
          className="relative bg-white rounded-[24px] border-[3px] border-gray-300 shadow-2xl overflow-hidden"
          style={cardFrameStyle}
        >
          <img
            src={isEndCard ? celebrationImg : standardBack}
            alt={isEndCard ? "Workout Complete" : "Card Back"}
            className="absolute inset-0 w-full h-full object-cover select-none"
            style={{ pointerEvents: "none" }}
          />
          {showPreWorkoutOverlay && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ pointerEvents: "none", padding: 24 }}
            >
              <div
                className="select-none"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transform: "translateY(10px)",
                }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(245,245,244,0.85)",
                    color: "#111827",
                    padding: "12px 16px",
                    borderRadius: 14,
                    minWidth: "65%",
                    fontSize: 40,
                    fontWeight: 700,
                    boxShadow: "0 8px 24px rgba(15,23,42,0.15)",
                    textAlign: "center",
                  }}
                >
                  {preWorkoutOverlay.exercises.map((name, idx) => (
                    <div key={`${name}-${idx}`}>{name}</div>
                  ))}
                  {preWorkoutOverlay.jokerLabel && (
                    <div>{preWorkoutOverlay.jokerLabel}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  const isJoker = card?.rank === "Joker";
  const isRed = card?.suit === "♥" || card?.suit === "♦";
  const pipColor = isRed ? "text-red-600" : "text-black";
  // Fallback-safe suit/color logic (avoids encoding issues)
  const isJokerFixed = isJoker;
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
        className="flex flex-col items-center justify-center w-full"
      >
        {isJokerFixed ? (
          <div
            className="relative bg-white rounded-[24px] border-[3px] border-gray-300 shadow-2xl overflow-hidden"
            style={cardFrameStyle}
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
                  fontSize: 40,
                  fontWeight: 700,
                  transform: "translateY(10px)",
                }}
              >
                {workout}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="relative bg-white rounded-[24px] border-[3px] border-gray-300 shadow-2xl overflow-hidden"
            style={cardFrameStyle}
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
              <div style={{ lineHeight: 1, fontSize: 69 }}>{card.rank}</div>
              <div style={{ lineHeight: 1, fontSize: 69 }}>{card.suit}</div>
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
              <div style={{ lineHeight: 1, fontSize: 69 }}>{card.rank}</div>
              <div style={{ lineHeight: 1, fontSize: 69 }}>{card.suit}</div>
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
                    transform: "translateY(10px)",
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
                        fontSize: 40,
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      {workout}
                    </div>
                    <div style={{ color: "#111827", fontSize: 40 }}>
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
                      fontSize: 40,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    {workout}
                  </div>
                  <div style={{ color: "#374151", fontSize: 40 }}>
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
