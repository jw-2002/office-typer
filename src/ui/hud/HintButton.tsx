// A faint hint button for the HUD: soft text with a small line icon. Used for standing up and, on phones, for switching to the screen.
import type { ReactNode } from "react";
import styles from "./HintButton.module.css";

// Line drawings in the text colour. Round ends and joins keep them friendly at a small size. Every icon is drawn on
// its own grid of `width` by `height` units, and CSS gives each unit the same size, so they all look the same scale.
export function HintIcon({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  return (
    <svg
      className={styles.icon}
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: `calc(${width} * var(--icon-unit))`, height: `calc(${height} * var(--icon-unit))` }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export default function HintButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={styles.hint}
      // Never takes focus on click, so typing keeps going to the game.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
