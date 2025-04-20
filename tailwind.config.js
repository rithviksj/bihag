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
    extend: {},
  },
  plugins: [],
};
