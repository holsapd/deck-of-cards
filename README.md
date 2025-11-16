# Deck of Cards Workout — Dev Notes

This app is a Vite + React project. Below are quick references for assets and common tweaks you might want during development.

Public assets (place in public/ with these exact names):
- theme-standard-playing-card.png – standard card back
- theme-standard-joker.png – Joker artwork (full-card background)
- theme-standard-jack.png, theme-standard-queen.png, theme-standard-king.png – face card backgrounds
- theme-standard-queen.png – fallback face background if a rank image is missing
- theme-standard-celebration.png – end-of-deck celebration image
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

Google Play (Trusted Web Activity) checklist
- Web installability: manifest (`public/manifest.json`) now defines name/description/icons/scope/start_url and must stay in sync with the PWA you deploy (Netlify URL).
- Digital Asset Links: update `public/.well-known/assetlinks.json` with your actual Play package name and the SHA-256 fingerprint from the keystore you use to sign the Android APK (Bubblewrap can print this).
- Packaging: install the free Bubblewrap CLI (`npm install -g @bubblewrap/cli`), run `bubblewrap init --manifest https://<your-domain>/manifest.json`, then `bubblewrap build`. This generates an Android project plus a signed release bundle/APK.
- Verification flow: after building, upload the `.aab` to the Google Play Console, then publish. Keep the same keystore for every update so the fingerprint in `assetlinks.json` stays valid.
