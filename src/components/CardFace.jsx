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

function AutoFitText({
  children,
  baseSize = 40,
  minSize = 16,
  className = "",
  style = {},
}) {
  const textRef = React.useRef(null);
  const [fontSize, setFontSize] = React.useState(baseSize);

  React.useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const measure = () => {
      const el = textRef.current;
      if (!el) return;
      // Use the actual content box width so padding on the parent doesn't cause us to over-estimate space
      const parent = el.parentElement;
      let availableWidth = el.clientWidth || 0;
      if (parent) {
        const style =
          typeof window !== "undefined" && parent instanceof HTMLElement
            ? window.getComputedStyle(parent)
            : null;
        const paddingLeft = style ? parseFloat(style.paddingLeft) || 0 : 0;
        const paddingRight = style ? parseFloat(style.paddingRight) || 0 : 0;
        const parentContentWidth =
          (parent.clientWidth || 0) - (paddingLeft + paddingRight);
        availableWidth = Math.max(availableWidth, parentContentWidth);
      }
      if (!availableWidth) return;
      const prevFontSize = el.style.fontSize;
      const prevWhiteSpace = el.style.whiteSpace;
      el.style.fontSize = `${baseSize}px`;
      el.style.whiteSpace = "nowrap";
      const naturalWidth = el.scrollWidth;
      el.style.fontSize = prevFontSize;
      el.style.whiteSpace = prevWhiteSpace;
      if (naturalWidth <= availableWidth) {
        setFontSize(baseSize);
        return;
      }
      const scale = availableWidth / naturalWidth;
      const nextSize = Math.max(minSize, Math.floor(baseSize * scale));
      setFontSize(nextSize);
    };

    measure();
    const hasWindow = typeof window !== "undefined";
    if (hasWindow) {
      window.addEventListener("resize", measure);
    }
    let resizeObserver;
    if (typeof ResizeObserver === "function") {
      resizeObserver = new ResizeObserver(() => measure());
      resizeObserver.observe(element.parentElement || element);
    }
    return () => {
      if (hasWindow) {
        window.removeEventListener("resize", measure);
      }
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [children, baseSize, minSize]);

  return (
    <div
      ref={textRef}
      className={className}
      style={{
        ...style,
        fontSize: `${fontSize}px`,
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "clip",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
}

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
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                padding: 24,
                transform: "translateY(-80px)",
              }}
            >
              <div
                className="select-none"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transform: "translateY(0px)",
                }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(245,245,244,0.85)",
                    color: "#111827",
                    padding: "12px 16px",
                    borderRadius: 14,
                    minWidth: "65%",
                    width: "100%",
                    maxWidth: "420px",
                    fontWeight: 700,
                    boxShadow: "0 8px 24px rgba(15,23,42,0.15)",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {preWorkoutOverlay.exercises.map((name, idx) => (
                    <AutoFitText
                      key={`${name}-${idx}`}
                      baseSize={40}
                      minSize={18}
                      style={{ color: "#111827" }}
                    >
                      {name}
                    </AutoFitText>
                  ))}
                  {preWorkoutOverlay.jokerLabel && (
                    <AutoFitText
                      baseSize={38}
                      minSize={18}
                      style={{ color: "#111827" }}
                    >
                      {preWorkoutOverlay.jokerLabel}
                    </AutoFitText>
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
                  width: "100%",
                  maxWidth: "420px",
                  fontWeight: 700,
                  transform: "translateY(10px)",
                }}
              >
                <AutoFitText
                  baseSize={40}
                  minSize={18}
                  style={{ fontWeight: 700 }}
                >
                  {workout}
                </AutoFitText>
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
                      width: "100%",
                      maxWidth: "420px",
                    }}
                  >
                    <AutoFitText
                      baseSize={40}
                      minSize={18}
                      style={{
                        color: "#111827",
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      {workout}
                    </AutoFitText>
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
                  <AutoFitText
                    baseSize={40}
                    minSize={18}
                    style={{
                      color: "#111827",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    {workout}
                  </AutoFitText>
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
