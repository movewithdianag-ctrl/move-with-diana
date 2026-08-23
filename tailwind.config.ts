import type { Config } from "tailwindcss";

/**
 * Design tokens — the entire palette lives here (see also src/index.css for
 * the matching CSS variables used in raw CSS).
 *
 * Palette rationale (per design brief §5): derived from a classical Pilates
 * studio's material world — warm plaster walls, espresso-stained wood, and
 * ONE committed accent: spring-steel blue-grey, the color of the springs on
 * a Gratz reformer. Deliberately NOT cream+terracotta, NOT black+acid-green.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm plaster/bone page ground (not yellow-cream)
        bone: "#F4F0E9",
        // Slightly deeper plaster for cards / alternate surfaces
        plaster: "#EAE3D7",
        // Deep espresso-ink for text
        ink: "#282018",
        // Muted warm grey-brown for secondary text
        umber: "#6B5F51",
        // THE accent: spring-steel blue-grey (reformer springs)
        steel: {
          DEFAULT: "#445862",
          deep: "#32434C",
        },
        // Near-black warm dark for the footer / CTA band
        char: "#1D1813",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "'Times New Roman'", "serif"],
        sans: [
          '"Instrument Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "sans-serif",
        ],
      },
      borderRadius: {
        // Single radius token used by every Photo / card (image system §6)
        photo: "0.75rem",
      },
      maxWidth: {
        measure: "65ch",
      },
      letterSpacing: {
        eyebrow: "0.14em",
      },
    },
  },
  plugins: [],
};

export default config;
