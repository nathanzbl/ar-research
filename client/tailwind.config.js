/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BYU Primary Colors
        'byu-navy': '#002E5D',
        'byu-royal': '#0047BA',
        // BYU Text Colors
        'byu-dark': '#141414',
        'byu-gray': '#666666',
        // BYU Interface Colors
        'byu-info': '#006073',
        'byu-info-light': '#1FB3D1',
        'byu-success': '#006141',
        'byu-success-light': '#10A170',
        'byu-warning': '#8C3A00',
        'byu-warning-light': '#FFB700',
        'byu-error': '#A3082A',
        'byu-error-light': '#E61744',
      },
      fontFamily: {
        'sans': ['"IBM Plex Sans"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontWeight: {
        'normal': '425',
        'medium': '500',
        'semibold': '600',
        'bold': '650',
      },
    },
  },
  plugins: [],
}
