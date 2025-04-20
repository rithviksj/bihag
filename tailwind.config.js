/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        indigo: {
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
        },
        blue: {
          100: '#DBEAFE',
        },
      },
    },
  },
  plugins: [],
}