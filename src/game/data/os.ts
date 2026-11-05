// The fake operating systems the computers run. Each one restyles the whole UI (see src/ui/osThemes.css).
// Names are parodies: no real product names in the game.

export type OsId = "classic" | "sky" | "pear" | "eleven" | "quantum";

export const osNames: Readonly<Record<OsId, string>> = {
  classic: "Wundows 95",
  sky: "Wundows XQ",
  pear: "Pear OS",
  eleven: "Wundows 11",
  quantum: "Quantum OS",
};
