import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colliers brand
        'colliers-navy': '#000759',
        'colliers-blue': '#25408F',
        'colliers-blue-bright': '#1C54F4',
        'colliers-blue-mid': '#3860BE',
        'colliers-green': '#468254',
        'colliers-gray': '#555555',
        'colliers-border': '#BDBDBD',
        // Surface system (from Stitch design)
        'surface': '#f8f9fb',
        'surface-bright': '#f8f9fb',
        'surface-dim': '#d9dadc',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#edeef0',
        'surface-container-high': '#e7e8ea',
        'surface-container-highest': '#e1e2e4',
        'surface-variant': '#e1e2e4',
        // On-surface
        'on-surface': '#191c1e',
        'on-surface-variant': '#464651',
        'on-background': '#191c1e',
        // Primary / secondary
        'primary': '#000000',
        'primary-container': '#050e5c',
        'on-primary': '#ffffff',
        'secondary': '#415aaa',
        'on-secondary': '#ffffff',
        // Tertiary (bright blue)
        'on-tertiary-container': '#5679ff',
        // Outline
        'outline': '#767682',
        'outline-variant': '#c6c5d2',
        // Error
        'error': '#ba1a1a',
        'inverse-surface': '#2e3132',
      },
      fontFamily: {
        sans: ['"Open Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        serif: ['"Merriweather"', 'Georgia', 'serif'],
        headline: ['"Merriweather"', 'Georgia', 'serif'],
        body: ['"Open Sans"', 'sans-serif'],
        label: ['"Open Sans"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0px',
        'none': '0px',
        'sm': '4px',
        'md': '4px',
        'lg': '0px',
        'xl': '0px',
        '2xl': '0px',
        'full': '9999px',
      },
      boxShadow: {
        'colliers-sm': '0 2px 8px rgba(0, 7, 89, 0.06)',
        'colliers-md': '0 8px 16px rgba(0, 7, 89, 0.08)',
      },
      maxWidth: {
        'container': '1200px',
        'container-xl': '1440px',
      },
      letterSpacing: {
        'overline': '2.1px',
        'label': '1.5px',
        'widest2': '0.3em',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #000759 0%, #050e5c 100%)',
      },
    },
  },
  plugins: [],
}
export default config
