/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    fontFamily: {
      main: ["Poppins", "sans-serif;"]
    },
    extend: {
      boxShadow: {
        'custom': '6px 6px 5px 0 rgba(92, 92, 92, 0.1)',
      },
      width: {
        main: '1300px'
      },
      backgroundColor: {
        main: '#f73995',
        overlay: 'rgba(0,0,0,0.3)'
      },
      colors: {
        main: '#f73995'
      },
      flex: {
        '2' : '2 2 0%',
        '3' : '3 3 0%',
        '4' : '4 4 0%',
        '5' : '5 5 0%',
        '6' : '6 6 0%',
        '7' : '7 7 0%',
        '8' : '8 8 0%'
      },
      keyframes: {
        'slide-top-sm': {
          '0%': { 
            '-webkit-transform': ' translateY(8px);',
            transform: 'translateY(8px);' 
          },
          '100%': { 
            '-webkit-transform': ' translateY(0px);',
            transform: 'translateY(0px);' 
          }
        },
      },
      animation: {
        'slide-top-sm': 'slide-top-sm 0.2s linear both',
      }
    },
  },
  plugins: [
    // require("@tailwindcss/line-clamp"),
    require("@tailwindcss/forms")
  ],
}
