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
      },
    },
    plugins: [],
  };