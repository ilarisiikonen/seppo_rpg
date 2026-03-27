/** @type {import('tailwindcss').Config} */
const allColors = [
  'primary', 'secondary', 'tertiary', 'error', 'amber-400',
  'on-surface-variant', 'primary-fixed-dim', 'green-400', 'amber-900',
  'amber-700', 'on-surface', 'on-secondary',
]
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  safelist: [
    ...allColors.flatMap(c => [
      `text-${c}`, `border-${c}`, `bg-${c}`,
      ...['10','15','20','25','30','40','50','60','70','80'].flatMap(o => [
        `text-${c}/${o}`, `border-${c}/${o}`, `bg-${c}/${o}`,
      ]),
    ]),
  ],
  theme: {
    screens: {
      sm: '1024px',
      md: '1024px',
      lg: '1280px',
      xl: '1536px',
    },
    extend: {
      colors: {
        "surface": "#17130f",
        "outline-variant": "#45483e",
        "on-surface-variant": "#c6c7bb",
        "on-secondary": "#2a3416",
        "surface-tint": "#ffba38",
        "primary-fixed": "#ffdeac",
        "tertiary-fixed-dim": "#ffb68c",
        "surface-container-low": "#1f1b17",
        "tertiary-container": "#713200",
        "surface-container-highest": "#39342f",
        "on-background": "#eae1da",
        "error": "#ffb4ab",
        "secondary": "#bfcca2",
        "primary-container": "#5c3e00",
        "surface-container": "#231f1b",
        "outline": "#909286",
        "tertiary": "#ffb68c",
        "surface-container-lowest": "#110e0a",
        "on-primary": "#432c00",
        "secondary-container": "#404b2a",
        "primary-fixed-dim": "#ffba38",
        "surface-container-high": "#2e2925",
        "background": "#17130f",
        "primary": "#ffba38",
        "surface-variant": "#39342f",
        "on-tertiary-container": "#f79b63",
        "on-primary-container": "#eaa400",
        "surface-bright": "#3d3833",
        "on-surface": "#eae1da",
        "inverse-surface": "#eae1da",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
      },
      fontFamily: {
        "headline": ["Epilogue"],
        "body": ["Newsreader"],
        "label": ["Space Grotesk"],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
    },
  },
  plugins: [],
}
