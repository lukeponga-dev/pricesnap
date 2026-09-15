// pricewise-theme.ts
// Shared constants for components that can't use Tailwind classes
// (e.g. inline styles, canvas, third-party libs)

export const PricewiseTheme = {
  colors: {
    green:    "#1E7F4F",
    greenDk:  "#15633F",
    cream:    "#F9F5EC",
    orange:   "#F4A259",
    orangeDk: "#D9893E",
    grey:     "#E5E5E5",
    charcoal: "#2D2D2D",
  },

  font: {
    family: `"Inter", system-ui, -apple-system, sans-serif`,
    weights: {
      regular:  400,
      medium:   500,
      semibold: 600,
    },
  },

  radius: {
    card: "1rem",
    btn:  "0.75rem",
    tag:  "0.5rem",
  },

  mobile: {
    fontSize: 16,
    h1: 20,
    h2: 18,
  },
} as const;
