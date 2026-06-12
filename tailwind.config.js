/** @type {import('tailwindcss').Config} */
const figmaColors = require('./design/tailwind-colors');

module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xl-custom': '1650px',
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // shadcn/ui tokens mapped to CSS vars
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",

        card: "hsl(var(--card) / <alpha-value>)",
        "card-foreground": "hsl(var(--card-foreground) / <alpha-value>)",

        popover: "hsl(var(--popover) / <alpha-value>)",
        "popover-foreground": "hsl(var(--popover-foreground) / <alpha-value>)",

        primary: "hsl(var(--primary) / <alpha-value>)",
        "primary-foreground": "hsl(var(--primary-foreground) / <alpha-value>)",

        secondary: "hsl(var(--secondary) / <alpha-value>)",
        "secondary-foreground": "hsl(var(--secondary-foreground) / <alpha-value>)",

        muted: "hsl(var(--muted) / <alpha-value>)",
        "muted-foreground": "hsl(var(--muted-foreground) / <alpha-value>)",

        accent: "hsl(var(--accent) / <alpha-value>)",
        "accent-foreground": "hsl(var(--accent-foreground) / <alpha-value>)",

        destructive: "hsl(var(--destructive) / <alpha-value>)",
        "destructive-foreground": "hsl(var(--destructive-foreground) / <alpha-value>)",

        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",

        // App-specific tokens
        brand: {
          DEFAULT: "hsl(var(--brand) / <alpha-value>)",
          fg: "hsl(var(--brand-fg) / <alpha-value>)",
        },
        bg: "hsl(var(--bg) / <alpha-value>)",
        fg: "hsl(var(--fg) / <alpha-value>)",

        // Figma tokens (auto-generated)
        ...figmaColors,
      },
      container: {
        center: true,
        padding: "1rem",
        screens: { "2xl": "1200px" },
      },
      borderRadius: {
        xl: "1rem",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
