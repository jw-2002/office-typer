// Phones only: switches between the full-screen desktop and the 3D office, so the player can still look around.
import { useViewStore } from "@/state/view/viewStore";
import HintButton, { HintIcon } from "./HintButton";

/** A little monitor on a stand: for "use the screen". */
const monitor = (
  <HintIcon width={28} height={24}>
    <rect x="3" y="3" width="22" height="14" rx="2" />
    <path d="M14 17 L14 21" />
    <path d="M9 21 L19 21" />
  </HintIcon>
);

/** An eye: for "look around the office". */
const eye = (
  <HintIcon width={30} height={20}>
    <path d="M2 10 C7 2 23 2 28 10 C23 18 7 18 2 10 Z" />
    <circle cx="15" cy="10" r="3.5" />
  </HintIcon>
);

export default function ScreenToggle() {
  const screenOpen = useViewStore((state) => state.screenOpen);
  const toggleScreen = useViewStore((state) => state.toggleScreen);
  return (
    <HintButton
      icon={screenOpen ? eye : monitor}
      label={screenOpen ? "Look around" : "Use screen"}
      onClick={toggleScreen}
    />
  );
}
