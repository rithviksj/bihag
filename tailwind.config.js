/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /bg-\[url.*\]/, // Allow custom background image utilities
    },
  ],
  theme: {
    extend: {
      animation: {
        drizzle: "drizzle 6s linear infinite", // Define the drizzle animation shortcut
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
