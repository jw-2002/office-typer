// A faint hint at the bottom of the screen to stand up or sit down. It is a real button underneath (so it works with
// a screen reader), but it looks like a suggestion: translucent text with a small icon (a shoe to stand up, a chair to sit).
import type { ReactNode } from "react";
import { useViewStore } from "@/state/viewStore";
import styles from "./PostureHint.module.css";

// Line drawings in the text colour. Round ends and joins keep them friendly at a small size. Every icon is drawn on
// its own grid of `width` by `height` units, and CSS gives each unit the same size, so they all look the same scale.
function Icon({ width, height, children }: { width: number; height: number; children: ReactNode }) {
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

/** A side-on sneaker, toe to the right: for "stand up", getting up on your feet. */
const shoe = (
  <Icon width={30} height={20}>
    <path d="M4 3 L11 3 L12 8 L20 10 C25 11 27 13 27 16 L27 17 L3 17 Z" />
    <path d="M3 13.5 L27 13.5" />
    <path d="M13.5 6.5 L16.5 7.7" />
    <path d="M15.5 9 L18.5 9.8" />
  </Icon>
);

/** A chair seen from the side, facing right: a tall backrest, a padded seat and two legs. */
const chair = (
  <Icon width={24} height={32}>
    <path d="M6 3 L6 15" />
    <rect x="6" y="15" width="14" height="4" rx="1.5" />
    <path d="M8 19 L8 29" />
    <path d="M18 19 L18 29" />
  </Icon>
);

export default function PostureHint() {
  const view = useViewStore((state) => state.view);
  const setView = useViewStore((state) => state.setView);
  const seated = view === "seated";

  return (
    <button
      type="button"
      className={styles.hint}
      // Never takes focus on click, so typing keeps going to the game.
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => setView(seated ? "standing" : "seated")}
    >
      {/* The icon hints at what you will do: a shoe to get up on your feet, a chair to sit. */}
      {seated ? shoe : chair}
      {seated ? "Stand up" : "Sit down"}
    </button>
  );
}
