
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7766C6",
        darkPurple: "#46467A",
        secondary: "#FFC212",
        tertiary: "#F9B0C3",
        base: "#ffffff",
        mediumPurple: "#E0DFFD",
        grayLight: "#D9D9D9",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
