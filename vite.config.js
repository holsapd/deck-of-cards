import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base URL can differ by deploy target. Prefer an explicit env var so
  // we can build for GitHub Pages ("/deck-of-cards/") or for a root host like
  // Netlify ("/") without changing code each time.
  // Use an explicit env override when needed, otherwise use a safe relative
  // base for production so both Netlify (root) and GitHub Pages (subpath)
  // will work without changing hosting settings.
  base:
    process.env.VITE_BASE_URL ||
    (process.env.NODE_ENV === "production" ? "./" : "/"),
});
