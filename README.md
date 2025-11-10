# Deck of Cards Workout — Dev Notes

This app is a Vite + React project. Below are quick references for assets and common tweaks you might want during development.

Public assets (place in public/ with these exact names):
- patriotic-playing-card.png – standard card back
- patriotic-joker.png – Joker artwork (full-card background)
- patriotic-jack.png, patriotic-queen.png, busch-king.png – face card backgrounds
- patriotic-queen-example.png – fallback face background if a rank image is missing
- hell-yeah-brother.png – end-of-deck celebration image
- hell-yeah-brother.m4a – optional celebration sound (played on end-of-deck)

Tweaking face/joker overlays
- File: src/components/CardFace.jsx
- Face-card overlay vertical position: look for transform: translateY(50px) in the J/Q/K overlay container and change the 50 value.
- Joker overlay vertical position: look for transform: translateY(50px) in the Joker overlay box and change the 50 value.

Corner sizes and colors
- File: src/components/CardFace.jsx
- Corner rank/suit sizes: adjust the fontSize values (e.g., 37 and 45) in the corner blocks.
- Red/black suits: logic uses card.isRed/Unicode suits, with a safe fallback.

Settings and persistence
- Files: src/App.jsx and src/components/Settings.jsx
- Settings persist via localStorage key: docw_settings
- Configurable: exercises by suit, difficulty multiplier, number of Jokers (0–10), Ace value (1 or 14), and a list of Joker workouts (unlimited; a random non-empty one is chosen when drawing a Joker).

Progress counter
- File: src/App.jsx
- Drawn count is computed as: totalCards - deck.length (first drawn card shows 1)

Deploy
- Netlify auto-builds on GitHub push.
- Build command: npm run build
- Publish directory: dist
- Local test: npm run build && npm run preview
