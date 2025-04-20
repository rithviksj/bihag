/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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
  plugins: [require('@tailwindcss/forms')],
}