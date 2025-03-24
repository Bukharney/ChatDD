// filepath: d:\ChatDD\frontend\tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', 
  ],
  theme: {
    extend: {
      colors: {
        'blue-dark': '#54F4FC',
        'blue-darker': '#0C2325',
        'blue-darkest': '#03101B',
        'green-dark' : '#329196',
        'blue': '#1A70B5',
        'blue-kind-of-dark': '#1A6FB5',
        'green': '#4CCD99',
        'yellow': '#FFF455',
        'black': '#0A0A0A',
        'dark-gray': '#1E1E1E',
        'gray': '#929292',
      },
    },
  },
  plugins: [],
};