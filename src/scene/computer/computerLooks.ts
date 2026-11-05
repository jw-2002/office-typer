// How each computer looks in 3D: the monitor frame, and the PC case beside it. Keyed by upgrade id, so a
// computer added to the upgrade list will not compile until it has a look.
import type { ComputerId } from "@/game/data/upgrades";

export type CaseLook = {
  kind: "desktop" | "tower" | "toaster";
  color: string;
  /** Width, height and depth in metres. */
  size: readonly [number, number, number];
  /** A glowing strip on the front, if any. */
  glow?: string;
};

/** How the keyboard that comes with a computer looks. */
export type KeyboardLook = {
  caseColor: string;
  /** Resting colour of the keycaps. */
  capColor: string;
  /** Colour of the letters on the keycaps. */
  legendColor: string;
  /** A glowing strip along the front edge, if any (gaming-style lighting). */
  glow?: string;
};

/** How the mouse (and its mat) that come with a computer look. */
export type MouseLook = { color: string; matColor: string; glow?: string };

export type ComputerLook = {
  frameColor: string;
  /** Plastic around the screen glass, in metres. Chunky for old monitors, thin for new ones. */
  bezel: number;
  /** Front to back thickness of the monitor. A deep one is a CRT. */
  depth: number;
  /** The PC case: a flat desktop under the monitor, a tower beside it, or a toaster. Laptops have none. */
  pcCase: CaseLook | null;
  keyboard: KeyboardLook;
  /** Laptops have a trackpad instead of a mouse, so they have none. */
  mouse: MouseLook | null;
  /** A laptop: the screen hinges off a flat base that the keyboard sits in. */
  laptop?: boolean;
  /** Width of the glass in metres, if not the usual one. A laptop's is smaller, so its keyboard does not look tiny. */
  screenWidth?: number;
  /** Height of the screen centre above the surface, if not the usual one. */
  screenY?: number;
};

export const computerLooks = {
  "beige-box": {
    frameColor: "#d8cfb8",
    bezel: 0.045,
    depth: 0.26,
    // A flat 90s desktop case with the CRT sitting on top. Its height matches the gap under the CRT, and both are kept low
    // so the old computers on the shelf behind can be seen over the top.
    pcCase: { kind: "desktop", color: "#d8cfb8", size: [0.46, 0.04, 0.36] },
    screenY: 0.265,
    keyboard: { caseColor: "#cfc6ae", capColor: "#e4dcc4", legendColor: "#4b4636" },
    mouse: { color: "#d8cfb8", matColor: "#7c6f57" },
  },
  "grey-tower": {
    frameColor: "#9ca3af",
    bezel: 0.03,
    depth: 0.05,
    pcCase: { kind: "tower", color: "#b6bcc6", size: [0.2, 0.44, 0.42] },
    keyboard: { caseColor: "#6b7280", capColor: "#e5e7eb", legendColor: "#1f2937" },
    mouse: { color: "#9ca3af", matColor: "#374151" },
  },
  "silver-laptop": {
    frameColor: "#c9ced6",
    bezel: 0.012,
    depth: 0.012,
    pcCase: null,
    keyboard: { caseColor: "#aeb4bd", capColor: "#f3f4f6", legendColor: "#374151" },
    mouse: null,
    laptop: true,
    // The lid hinges at the back of the base, so the screen sits lower than a monitor on a stand.
    screenWidth: 0.5,
    screenY: 0.175,
  },
  "gaming-rig": {
    frameColor: "#111827",
    bezel: 0.008,
    depth: 0.03,
    pcCase: { kind: "tower", color: "#0b0f1a", size: [0.22, 0.46, 0.44], glow: "#ff2bd6" },
    keyboard: { caseColor: "#0b0f1a", capColor: "#1f2937", legendColor: "#ff9ef0", glow: "#ff2bd6" },
    mouse: { color: "#111827", matColor: "#0b0f1a", glow: "#ff2bd6" },
  },
  "quantum-toaster": {
    frameColor: "#2a1a4a",
    bezel: 0.006,
    depth: 0.02,
    pcCase: { kind: "toaster", color: "#cfd5de", size: [0.26, 0.18, 0.18], glow: "#ffb347" },
    keyboard: { caseColor: "#2a1a4a", capColor: "#d6dae2", legendColor: "#2a1a4a", glow: "#ffb347" },
    mouse: { color: "#cfd5de", matColor: "#2a1a4a", glow: "#ffb347" },
  },
} as const satisfies Record<ComputerId, ComputerLook>;

const looksById: Readonly<Record<string, ComputerLook>> = computerLooks;

/** The look for a computer id, falling back to the first computer for an unknown one. */
export function computerLook(id: string | undefined): ComputerLook {
  return (id !== undefined && looksById[id]) || computerLooks["beige-box"];
}
