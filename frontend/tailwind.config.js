/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', 
  ],
  theme: {
    extend: {
      colors: {
        'blue-light': '#54F4FC',
        'blue-dark': '#0C2325',
        'blue-darker': '#03101B',
        'blue-darkest':'#0B314F',
        'blue': '#1A70B5',
        'green': '#4CCD99',
        'yellow': '#FFF455',
        'black': '#0A0A0A',
        'brown': '#827900',
        'dark-gray': '#1E1E1E',
        'gray': '#929292',
        'gray-light': '#D9D9D9',
        'border-gray': '#1E1E1E',
        'custom-bg-gray' : '#0A0A0A',
        'dark-teal':'#329196',
      },
      fontSize: {
        '2xs': '0.625rem', 
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
};