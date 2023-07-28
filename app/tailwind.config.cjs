/** @type {import('tailwindcss').Config} */

// **********Colors************
// In DSFR, $border-default-grey and $background-default-grey are different colors
// => We create color names based on those color decisions, not the color code itself
// It's a bit redundant in tailwind class, e.g. "bg-bg-default-grey", but easier to match with DSFR color

const createColorObject = (colorNames, decisionPrefix) =>
  Object.fromEntries(colorNames.map((name) => [name, `var(--${decisionPrefix}-${name})`]))

const background = createColorObject(
  ["alt-grey", "alt-blue-france", "contrast-grey", "contrast-info", "default-grey", "flat-info", "flat-success", "flat-warning", "raised-grey"],
  "background"
)
const border = createColorObject(["default-grey", "action-high-grey"], "border")
const text = createColorObject(["mention-grey", "active-grey", "disabled-grey"], "text")
const artwork = createColorObject([], "artwork")

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  corePlugins: {
    preflight: false,
  },
  important: "#root",
  plugins: [],
  safelist: [
    //include classes from backend HTML
    "bg-bg-flat-info",
    "bg-bg-flat-success",
    "bg-bg-flat-warning",
    "border-collapse",
    "text-bg-flat-info",
    "text-bg-flat-success",
    "text-bg-flat-warning",
  ],
  theme: {
    screens: {
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1248px",
      xxl: "1440px",
    },
    colors: {
      bg: background,
      bd: border,
      tx: text,
      aw: artwork,
      outline: "#0a76f6",
    },
    boxShadow: {
      overlap: "var(--overlap-shadow)",
      input: "inset 0 -2px 0 0 var(--border-plain-grey)",
      "input-disabled": "inset 0 -2px 0 0 var(--border-disabled-grey)",
      tile: "inset 0 -.25rem 0 0 var(--border-plain-blue-france)",
      card: "0 8px 16px 0 rgba(0,0,0,.1), 0 8px 16px -16px rgba(0,0,0,.32)"
    },
    extend: {},
  },
}
