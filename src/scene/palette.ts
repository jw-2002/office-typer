// Colours and sizes shared by the office scene. 1 world unit is 1 metre.
export const palette = {
  background: "#111827",
  floor: "#7a6148",
  wall: "#c9d3df",
  desk: "#a47a52",
  deskLeg: "#3b4252",
  plastic: "#1f2937",
  screenOff: "#0b1220",
} as const;

/** Height of the desk's top surface above the floor. */
export const DESK_HEIGHT = 0.75;

/** One keycap unit in the keyboard layout is about 19 mm, so the keyboard group is scaled by this. */
export const KEY_UNIT = 0.019;

/** Rough centre (x, z) of a computer set, for placing a scaled copy of it, for example on the shelf. */
export const SET_CENTER = { x: 0.1, z: -0.25 } as const;
