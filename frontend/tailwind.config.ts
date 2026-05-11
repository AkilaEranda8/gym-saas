import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/react-table-craft/dist/**/*.{js,mjs}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#fdf4ff",
          100: "#fae8ff",
          200: "#f3d1ff",
          300: "#e8affe",
          400: "#d87bfb",
          500: "#c44cf6",
          600: "#aa2de0",
          700: "#8f21be",
          800: "#761e9b",
          900: "#621c7d",
          950: "#420756",
        },
        brand: {
          DEFAULT: "#7c3aed",
          dark:    "#5b21b6",
          light:   "#a78bfa",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
