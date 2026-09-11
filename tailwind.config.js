/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        pine: { DEFAULT: '#1F3D2E', light: '#2C5540', dark: '#152A20' },
        dusk: { DEFAULT: '#2B3A55', light: '#3D5075' },
        amber: { DEFAULT: '#E0902E', light: '#F0AC5C', dark: '#B8721E' },
        slate2: { DEFAULT: '#8B96A5', light: '#B7BFC9', dark: '#5F6B7A' },
        mist: '#F5F4EF',
        paper: '#FBFAF7',
        ink: '#1C1F1D',
        line: '#E3E0D6',
      },
      fontFamily: {
        display: ['"Newsreader"', 'serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
