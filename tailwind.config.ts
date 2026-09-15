import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Colours ──────────────────────────────
      colors: {
        navy: {
          950: "#F8FAFC", // Slate 50 - Background
          900: "#FFFFFF", // White - Card Background
          800: "#F1F5F9", // Slate 100 - Hover Background
        },
        surface: "#E2E8F0", // Slate 200 - Borders and Dividers
        snap: { DEFAULT: "#059669", dark: "#047857", light: "#10B981" }, // Emerald Green
        lime: { DEFAULT: "#2563EB", dark: "#1D4ED8" }, // Blue
        amber: { DEFAULT: "#0EA5E9", dark: "#0284C7" }, // Sky Blue
        ink: { DEFAULT: "#0F172A", dim: "#334155", faint: "#94A3B8" }, // Slate 900 / 700 / 400
      },

      // ── Fonts ────────────────────────────────
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },

      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },

      fontSize: {
        "2xs": "0.6875rem",
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
      },

      borderRadius: {
        card: "1rem",
        btn: "0.75rem",
        tag: "0.375rem",
        icon: "0.625rem",
        full: "9999px",
      },

      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.3)",
        "card-lg": "0 4px 12px rgba(0,0,0,0.4)",
        glow: "0 0 20px rgba(16,185,129,0.15)",
        "glow-lg": "0 0 40px rgba(16,185,129,0.25)",
      },

      animation: {
        "scan-line": "scan-line 2s ease-in-out infinite",
        "fade-in": "fade-in-up 0.5s ease forwards",
      },

      keyframes: {
        "scan-line": {
          "0%, 100%": { top: "0%", opacity: "0.3" },
          "50%": { top: "100%", opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(0.75rem)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
