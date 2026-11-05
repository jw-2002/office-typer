// A faint hint to stand up or sit down. It is a real button underneath (so it works with a screen reader), but it looks
// like a suggestion: translucent text with a small icon (a shoe to stand up, a chair to sit).
import { useViewStore } from "@/state/view/viewStore";
import HintButton, { HintIcon } from "./HintButton";

/** A side-on sneaker, toe to the right: for "stand up", getting up on your feet. */
const shoe = (
  <HintIcon width={30} height={20}>
    <path d="M4 3 L11 3 L12 8 L20 10 C25 11 27 13 27 16 L27 17 L3 17 Z" />
    <path d="M3 13.5 L27 13.5" />
    <path d="M13.5 6.5 L16.5 7.7" />
    <path d="M15.5 9 L18.5 9.8" />
  </HintIcon>
);

/** A chair seen from the side, facing right: a tall backrest, a padded seat and two legs. */
const chair = (
  <HintIcon width={24} height={32}>
    <path d="M6 3 L6 15" />
    <rect x="6" y="15" width="14" height="4" rx="1.5" />
    <path d="M8 19 L8 29" />
    <path d="M18 19 L18 29" />
  </HintIcon>
);

export default function PostureHint() {
  const view = useViewStore((state) => state.view);
  const setView = useViewStore((state) => state.setView);
  const seated = view === "seated";
  // During the intro (and the redundancy notice) there is nothing to stand up from.
  if (view === "intro" || view === "notice") return null;

  return (
    <HintButton
      // The icon hints at what you will do: a shoe to get up on your feet, a chair to sit.
      icon={seated ? shoe : chair}
      label={seated ? "Stand up" : "Sit down"}
      onClick={() => setView(seated ? "standing" : "seated")}
    />
  );
}
