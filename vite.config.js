import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ✅ This line ensures correct paths for GitHub Pages and local dev
  base: process.env.NODE_ENV === "production" ? "/deck-of-cards/" : "/",
});
