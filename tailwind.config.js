/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // adjust this based on your project structure
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /bg-\[url.*\]/, // ensures your Unsplash background survives purge
    },
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
