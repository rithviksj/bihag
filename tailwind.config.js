/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    { pattern: /bg-gradient-to-.*/ },
    { pattern: /from-\[#.*\]/ },
    { pattern: /via-\[#.*\]/ },
    { pattern: /to-\[#.*\]/ },
    { pattern: /bg-\[url.*\]/ },
    { pattern: /bg-gradient-to-.*/ },
    { pattern: /from-blue-.*/ },
    { pattern: /via-blue-.*/ },
    { pattern: /to-blue-.*/ },
  ],
  theme: {
    extend: {
      animation: {
        drizzle: "drizzle 6s linear infinite",
      },
      keyframes: {
        drizzle: {
          "0%": {
            transform: "translateY(-10%)",
            opacity: "0.2",
          },
          "100%": {
            transform: "translateY(110vh)",
            opacity: "0",
          },
        },
      },
    },
  },
  plugins: [],
};