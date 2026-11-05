// Measurements of the laptop base, shared by the base itself and the keyboard that sits on it.

/**
 * Size of the base, and where its middle is, in metres relative to the laptop's spot on the desk. The base is as wide as
 * the lid (screen plus bezel), which `laptopBaseWidth` works out, and its back edge meets the lid's front at z = -0.15.
 */
export const LAPTOP_BASE = { height: 0.02, depth: 0.31, z: 0.005 } as const;

export const laptopBaseWidth = (screenWidth: number, bezel: number): number => screenWidth + bezel * 2;
/** How far the keyboard is moved toward the screen so it fits on the base, compared with a desk keyboard. */
export const LAPTOP_KEYBOARD_SHIFT = -0.175;
/** Where the back edge of the keys is, so the base's dark well lines up with them. */
export const KEYBOARD_BACK_Z = 0.12 + LAPTOP_KEYBOARD_SHIFT;
