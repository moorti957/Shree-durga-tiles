/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/app/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/components/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/modules/**/*.{js,jsx,ts,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        "admin-primary": "#1D4ED8",
        "admin-secondary": "#1E40AF",
        "admin-bg": "#F4F5F7",
        "admin-card": "#FFFFFF",
        "admin-sidebar": "#151922",
        "admin-sidebar-muted": "#CBD5E1",
        "admin-text": "#1F2937",
        "admin-secondary-text": "#475569",
        "admin-label": "#1F2937",
        "admin-description": "#475569",
        "admin-muted": "#64748B",
        "admin-border": "#E2E8F0",
        "admin-hover": "#F1F5F9",
        "admin-success": "#16A34A",
        "admin-danger": "#DC2626",
        "admin-warning": "#B45309",
        "admin-info": "#2563EB",
        ivory: "#F8FAFC",
        sand: "#F1F5F9",
        brown: "#1F2937",
        "brown-light": "#64748B",
        "brown-dark": "#111827",
        gold: "#1D4ED8",
        "gold-light": "#DBEAFE",
        "gold-dark": "#1E40AF",
        maroon: "#334155",
        "deep-maroon": "#334155",
        "maroon-dark": "#1E293B",
        "maroon-light": "#475569",
        "premium-black": "#151922",
      },

      fontFamily: {
        inter: ["Inter", "sans-serif"],
        cinzel: ["Cinzel", "serif"],
      },

      boxShadow: {
        gold: "0 8px 24px rgba(29, 78, 216, 0.18)",
      },
    },
  },

  plugins: [],
};
