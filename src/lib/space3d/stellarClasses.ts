/**
 * Harvard spectral classes for main-sequence stars. Temperature/mass/radius ranges
 * are the conventional textbook values. Colors start from the perceived blackbody
 * colors (Mitchell Charity's "What color are the stars?"), with G/K/M warmed so the
 * blue→red temperature sequence reads clearly on screen.
 */

export type SpectralClass = "O" | "B" | "A" | "F" | "G" | "K" | "M";

export interface StellarClassInfo {
  spectralClass: SpectralClass;
  color: string;
  temperatureK: string;
  massSolar: string;
  radiusSolar: string;
  /** Representative radius (R☉) used to size the 3D model. */
  typicalRadiusSolar: number;
  example: string;
  description: string;
  /** NASA Image Library search term for related imagery. */
  searchTerm: string;
}

export const STELLAR_CLASSES: StellarClassInfo[] = [
  {
    spectralClass: "O",
    color: "#9bb0ff",
    temperatureK: "≥ 30,000 K",
    massSolar: "≥ 16",
    radiusSolar: "≥ 6.6",
    typicalRadiusSolar: 10,
    example: "Zeta Puppis (O4)",
    description:
      "The hottest, most massive stars. They blaze blue-violet, live only a few million years, and end as supernovae. Fewer than 1 in 3 million main-sequence stars are O-type.",
    searchTerm: "massive star",
  },
  {
    spectralClass: "B",
    color: "#aabfff",
    temperatureK: "10,000 – 30,000 K",
    massSolar: "2.1 – 16",
    radiusSolar: "1.8 – 6.6",
    typicalRadiusSolar: 4,
    example: "Spica (B1V)",
    description:
      "Luminous blue-white stars that dominate young open clusters like the Pleiades, lighting up the gas they formed from.",
    searchTerm: "Pleiades",
  },
  {
    spectralClass: "A",
    color: "#cad7ff",
    temperatureK: "7,500 – 10,000 K",
    massSolar: "1.4 – 2.1",
    radiusSolar: "1.4 – 1.8",
    typicalRadiusSolar: 1.7,
    example: "Sirius A (A1V), Vega (A0V)",
    description:
      "White stars with strong hydrogen absorption lines. Many of the brightest stars in the night sky are A-type.",
    searchTerm: "Sirius",
  },
  {
    spectralClass: "F",
    color: "#f8f7ff",
    temperatureK: "6,000 – 7,500 K",
    massSolar: "1.04 – 1.4",
    radiusSolar: "1.15 – 1.4",
    typicalRadiusSolar: 1.3,
    example: "Procyon A (F5IV–V)",
    description:
      "Yellow-white stars slightly hotter and more massive than the Sun, with lifetimes of a few billion years.",
    searchTerm: "Procyon",
  },
  {
    spectralClass: "G",
    color: "#fff1c9",
    temperatureK: "5,200 – 6,000 K",
    massSolar: "0.8 – 1.04",
    radiusSolar: "0.96 – 1.15",
    typicalRadiusSolar: 1,
    example: "The Sun (G2V)",
    description:
      "Sun-like yellow stars that burn steadily for about 10 billion years — the class our own star belongs to.",
    searchTerm: "Sun",
  },
  {
    spectralClass: "K",
    color: "#ffb870",
    temperatureK: "3,700 – 5,200 K",
    massSolar: "0.45 – 0.8",
    radiusSolar: "0.7 – 0.96",
    typicalRadiusSolar: 0.8,
    example: "Alpha Centauri B (K1V)",
    description:
      "Orange dwarfs: stable, long-lived stars that are a prime target in the search for habitable exoplanets.",
    searchTerm: "Alpha Centauri",
  },
  {
    spectralClass: "M",
    color: "#ff7f45",
    temperatureK: "2,400 – 3,700 K",
    massSolar: "0.08 – 0.45",
    radiusSolar: "≤ 0.7",
    typicalRadiusSolar: 0.3,
    example: "Proxima Centauri (M5.5V)",
    description:
      "Cool red dwarfs, the most common stars in the galaxy (about 3 in 4). They can shine for trillions of years.",
    searchTerm: "red dwarf",
  },
];

/** Log-compressed display radius so O stars don't dwarf M dwarfs off-screen. */
export function starDisplayRadius(radiusSolar: number): number {
  return 1 + 1.1 * Math.log2(1 + radiusSolar);
}
