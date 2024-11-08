/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
      extend: {
        animation: {
          'fade-in': 'fade-in 1s ease-out',
          'slide-up': 'slide-up 1s ease-out',
          'blink': 'blink 1s step-end infinite',
        },
        zIndex: {
          '60': '60',
          '70': '70',
          '80': '80',
          '90': '90',
          '100': '100',
        },
      },
    },
    plugins: [],
  };