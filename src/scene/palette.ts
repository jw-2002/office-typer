// Colours and sizes shared by the office scene. 1 world unit is 1 metre.
//
// The room sticks to a small set of colours so it looks designed rather than assembled: warm woods and cream trim, a
// cool grey-blue wall, dark plastic and metal, and a few bright accents (a red rug, green leaves, yellow notes).
export const palette = {
  background: "#111827",
  floor: "#7a6148",
  wall: "#c9d3df",
  desk: "#a47a52",
  deskLeg: "#3b4252",
  plastic: "#1f2937",
  screenOff: "#0b1220",
  /** Painted trim: skirting boards, window frames. */
  trim: "#ece6d8",
  /** The three browns of the floor boards, so they do not look printed. */
  planks: ["#7a6148", "#84694c", "#72593f"],
  rug: "#8c3b3b",
  rugBorder: "#6a2a2a",
  paper: "#f6f1e4",
  corkBoard: "#b98a56",
  /** Sticky note colours. */
  notes: ["#fde047", "#f9a8d4", "#93c5fd", "#86efac"],
  /** Fabric and leather: the chair, the curtains. */
  fabric: "#374151",
  curtain: "#b5483a",
  leaf: "#3f9b4a",
  terracotta: "#c2703a",
  mug: "#e5e7eb",
  /** Dark brown for outlines round the blocks. */
  outline: "#22160e",
} as const;

/** Settings for the dark outline drawn round the main blocks, for a chunky toy look. */
export const outline = { thickness: 0.004, color: palette.outline } as const;

/** Height of the desk's top surface above the floor. */
export const DESK_HEIGHT = 0.75;

/** One keycap unit in the keyboard layout is about 19 mm, so the keyboard group is scaled by this. */
export const KEY_UNIT = 0.019;

/** Rough centre (x, z) of a computer set, for placing a scaled copy of it, for example on the shelf. */
export const SET_CENTER = { x: 0.1, z: -0.25 } as const;
