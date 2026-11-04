// Measurements of the laptop base, shared by the base itself and the keyboard that sits on it.
/** Size of the base, and where its middle is, in metres relative to the laptop's spot on the desk. */
export const LAPTOP_BASE = { width: 0.6, height: 0.02, depth: 0.3, z: 0 } as const;
/** How far the keyboard is moved toward the screen so it fits on the base, compared with a desk keyboard. */
export const LAPTOP_KEYBOARD_SHIFT = -0.235;
