import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Automatically handle images and correct paths on GitHub Pages or Netlify
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? "/deck-of-cards/" : "/",
});
