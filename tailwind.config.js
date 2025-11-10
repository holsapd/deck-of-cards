/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    // ensure dynamic color classes are generated
    'text-red-600',
    'text-black',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
