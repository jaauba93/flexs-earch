const path = require('path')
const root = __dirname

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(root, 'pages/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(root, 'components/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(root, 'app/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(root, 'lib/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        'colliers-navy': '#000759',
        'colliers-blue': '#25408F',
        'colliers-blue-bright': '#1C54F4',
        'colliers-blue-mid': '#3860BE',
        'colliers-blue-dark': '#1D4F76',
        'colliers-bg-light-blue': '#EDF2FF',
        'colliers-bg-blue-tint': '#DBE5FF',
        'colliers-bg-gray': '#F4F4F4',
        'colliers-green': '#468254',
        'colliers-cyan': '#0C9ED9',
        'colliers-gray': '#555555',
        'colliers-border': '#BDBDBD',
        'colliers-dark-text': '#212121',
      },
      fontFamily: {
        sans: ['"Open Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        serif: ['"Merriweather"', 'Georgia', 'serif'],
      },
      fontSize: {
        'overline': ['14px', { lineHeight: 'normal', letterSpacing: '2.1px' }],
      },
      borderRadius: {
        DEFAULT: '0px',
        'none': '0px',
        'sm': '4px',
        'md': '4px',
        'lg': '4px',
        'xl': '4px',
        '2xl': '4px',
        'full': '9999px',
      },
      boxShadow: {
        'colliers-sm': '0 2px 8px rgba(0, 7, 89, 0.06)',
        'colliers-md': '0 4px 16px rgba(0, 7, 89, 0.10)',
      },
      maxWidth: {
        'container': '1200px',
        'container-xl': '1400px',
      },
      letterSpacing: {
        'overline': '2.1px',
        'label': '1.5px',
      },
    },
  },
  plugins: [],
}
