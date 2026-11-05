// The small pictures on the task bar buttons: a document, a bag, a ladder, a robot head and a gear. They draw in the text
// colour, so every operating system theme colours them correctly.
import type { ReactNode } from "react";

export type TabIconName = "assignment" | "shop" | "career" | "assistant" | "settings";

// Each picture is drawn on a 24 by 24 grid with a plain outline, so they all look like one set.
const pictures: Record<TabIconName, ReactNode> = {
  // A page with a folded corner and lines of text.
  assignment: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 15h6M9 18h4" />
    </>
  ),
  // A shopping bag with a handle.
  shop: (
    <>
      <path d="M5 8h14l-1 13H6z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  // A ladder: two rails and four rungs.
  career: (
    <>
      <path d="M8 3v18M16 3v18" />
      <path d="M8 7h8M8 11h8M8 15h8M8 19h8" />
    </>
  ),
  // A robot head: a square head, an aerial, two eyes and a mouth.
  assistant: (
    <>
      <rect x="5" y="8" width="14" height="11" rx="2" />
      <path d="M12 8V4" />
      <circle cx="12" cy="3.5" r="1" />
      <circle cx="9" cy="13" r="1.3" />
      <circle cx="15" cy="13" r="1.3" />
      <path d="M9.5 16.5h5M3 12v3M21 12v3" />
    </>
  ),
  // A gear: a ring with eight teeth around a hub.
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="6.5" />
    </>
  ),
};

export default function TabIcon({ name }: { name: TabIconName }) {
  return (
    <svg
      width="1.7em"
      height="1.7em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {pictures[name]}
    </svg>
  );
}
