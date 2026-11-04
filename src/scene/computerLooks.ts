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

export type ComputerLook = {
  frameColor: string;
  /** Plastic around the screen glass, in metres. Chunky for old monitors, thin for new ones. */
  bezel: number;
  /** Front to back thickness of the monitor. A deep one is a CRT. */
  depth: number;
  /** The PC case: a flat desktop under the monitor, a tower beside it, or a toaster. Laptops have none. */
  pcCase: CaseLook | null;
};

export const computerLooks = {
  "beige-box": {
    frameColor: "#d8cfb8",
    bezel: 0.045,
    depth: 0.26,
    // A flat 90s desktop case with the CRT sitting on top. Its height matches the gap under the CRT.
    pcCase: { kind: "desktop", color: "#d8cfb8", size: [0.46, 0.075, 0.36] },
  },
  "grey-tower": {
    frameColor: "#9ca3af",
    bezel: 0.03,
    depth: 0.05,
    pcCase: { kind: "tower", color: "#b6bcc6", size: [0.2, 0.44, 0.42] },
  },
  "silver-laptop": {
    frameColor: "#c9ced6",
    bezel: 0.012,
    depth: 0.012,
    pcCase: null,
  },
  "gaming-rig": {
    frameColor: "#111827",
    bezel: 0.008,
    depth: 0.03,
    pcCase: { kind: "tower", color: "#0b0f1a", size: [0.22, 0.46, 0.44], glow: "#ff2bd6" },
  },
  "quantum-toaster": {
    frameColor: "#2a1a4a",
    bezel: 0.006,
    depth: 0.02,
    pcCase: { kind: "toaster", color: "#cfd5de", size: [0.26, 0.18, 0.18], glow: "#ffb347" },
  },
} as const satisfies Record<ComputerId, ComputerLook>;
