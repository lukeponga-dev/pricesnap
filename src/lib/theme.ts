export const PriceSnapTheme = {
  colors: {
    navy: { 950: "#0A1628", 900: "#0F1D32", 800: "#1A2D4A" },
    surface: "#1E293B",
    snap: { DEFAULT: "#10B981", dark: "#059669", light: "#34D399" },
    lime: { DEFAULT: "#84CC16", dark: "#65A30D" },
    amber: { DEFAULT: "#F59E0B", dark: "#D97706" },
    ink: { DEFAULT: "#F8FAFC", dim: "#94A3B8", faint: "#475569" },
  },
  font: {
    display: "'Space Grotesk', system-ui, sans-serif",
    body: "Inter, system-ui, -apple-system, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
    weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  },
  radius: { card: "1rem", btn: "0.75rem", tag: "0.375rem", icon: "0.625rem" },
  voice: {
    use: ["Friendly", "Clear", "Trustworthy", "Data-backed", "Volunteer-friendly"],
    avoid: ["Reseller jargon", "Flipping", "Margin", "Neural net", "Confidence scores"],
  },
} as const;
