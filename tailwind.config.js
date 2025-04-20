/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"IBM Plex Serif"', 'serif']
      },
      animation: {
        drizzle: "drizzle 6s linear infinite"
      },
      keyframes: {
        drizzle: {
          "0%": { transform: "translateY(-10%)", opacity: "0.2" },
          "100%": { transform: "translateY(110vh)", opacity: "0" }
        }
      }
    },
  },
  plugins: [],
}