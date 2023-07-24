/** @type {import('tailwindcss').Config} */

// **********Colors************
// In DSFR, $border-default-grey and $background-default-grey are different colors
// => We create color names based on those color decisions, not the color code itself
// It's a bit redundant in tailwind class, e.g. "bg-bg-default-grey", but easier to match with DSFR color

const createColorObject = (colorNames, decisionPrefix) =>
  Object.fromEntries(colorNames.map((name) => [name, `var(--${decisionPrefix}-${name})`]))

const background = createColorObject(
  ["alt-grey", "contrast-grey", "contrast-info", "default-grey"],
  "background"
)
const border = createColorObject(["default-grey"], "border")
const text = createColorObject(["mention-grey", "active-grey", "disabled-grey"], "text")
const artwork = createColorObject([], "artwork")

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  corePlugins: {
    preflight: false,
  },
  important: "#root",
  plugins: [],
  theme: {
    screens: {
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1248px",
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
    },
    extend: {},
  },
}
