/** @type {import('tailwindcss').Config} */

const colorScale = (color) => ({
  50: color,
  100: color,
  200: color,
  300: color,
  400: color,
  500: color,
  600: color,
  700: color,
  800: color,
  900: color,
  950: color,
});

module.exports = {
  darkMode: ["class"],

  content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/app/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/components/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/pages/**/*.{js,jsx,ts,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        gold: "#B08D57",
        "gold-dark": "#76551F",
        "gold-light": "#D4B27A",
        charcoal: "#0E0F12",
        maroon: "#8E1B16",
        "maroon-dark": "#241110",
        "maroon-light": "#9C2A20",
        "deep-maroon": "#241110",
        red: colorScale("#8E1B16"),
        orange: colorScale("#B08D57"),
        pink: colorScale("#9C2A20"),
        rose: colorScale("#9C2A20"),
        fuchsia: colorScale("#9C2A20"),
        purple: colorScale("#76551F"),
        violet: colorScale("#76551F"),
        indigo: colorScale("#241110"),
        blue: colorScale("#3E3B36"),
        sky: colorScale("#4E4B45"),
        cyan: colorScale("#4E4B45"),
        teal: colorScale("#25463A"),
        yellow: colorScale("#D4B27A"),
        amber: colorScale("#D4B27A"),
        ivory: "#F5F3EF",
        sand: "#ECE8E0",
        brown: "#121316",
        "brown-light": "#4E4B45",
        "brown-dark": "#0E0F12",
        "premium-black": "#0A0B0D",
        black: "#0A0B0D",
        white: "#FFFFFF",
        gray: {
          50: "#F5F3EF",
          100: "#ECE8E0",
          200: "#E3DED4",
          300: "#C9C1B4",
          400: "#8C8473",
          500: "#6A665E",
          600: "#4E4B45",
          700: "#3E3B36",
          800: "#242321",
          900: "#121316",
          950: "#0A0B0D",
        },
        slate: {
          50: "#F5F3EF",
          100: "#ECE8E0",
          200: "#E3DED4",
          300: "#C9C1B4",
          400: "#8C8473",
          500: "#6A665E",
          600: "#4E4B45",
          700: "#3E3B36",
          800: "#242321",
          900: "#121316",
          950: "#0A0B0D",
        },
        border: "#E3DED4",
        input: "#8C8473",
        ring: "#86652F",
        background: "#F5F3EF",
        foreground: "#121316",

        primary: {
          DEFAULT: "#121316",
          foreground: "#F5F3EF",
        },

        secondary: {
          DEFAULT: "#ECE8E0",
          foreground: "#121316",
        },

        destructive: {
          DEFAULT: "#8E1B16",
          foreground: "#FFFFFF",
        },

        muted: {
          DEFAULT: "#ECE8E0",
          foreground: "#4E4B45",
        },

        accent: {
          DEFAULT: "#D4B27A",
          foreground: "#121316",
        },

        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#121316",
        },

        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#121316",
        },
      },

      fontFamily: {
        cinzel: ["var(--font-display)", "Georgia", "serif"],
        inter: ["var(--font-ui)", "Arial", "sans-serif"],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      boxShadow: {
        gold: "0 10px 24px rgba(134, 101, 47, 0.2)",
        red: "0 10px 24px rgba(142, 27, 22, 0.15)",
        yellow: "0 10px 24px rgba(212, 178, 122, 0.2)",
      },

      keyframes: {
        float: {
          "0%,100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-12px)",
          },
        },

        shimmer: {
          "0%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },

        "pulse-glow": {
          "0%,100%": {
            opacity: "0.5",
          },
          "50%": {
            opacity: "1",
          },
        },
      },

      animation: {
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
};