/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00f2ff", // Neon Cyan
        secondary: "#7000ff", // Electric Purple
        darkBg: "#020617", // Deep Space Blue
      },
    },
  },
  plugins: [],
};
