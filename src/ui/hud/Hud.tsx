// The 2D overlay: the stand up / sit down hint, and on touch devices the desktop full screen (the 3D monitor is no use for typing there).
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useHudScreen } from "@/hooks/useHudScreen";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { useCurrentAssignment } from "@/state/assignment/useCurrentAssignment";
import Desktop from "@/ui/desktop/Desktop";
import { useViewStore } from "@/state/view/viewStore";
import PostureHint from "./PostureHint";
import ScreenToggle from "./ScreenToggle";
import TypingSink from "@/ui/programs/TypingSink";
import styles from "./Hud.module.css";

export default function Hud() {
  const current = useCurrentAssignment();
  const touch = useCoarsePointer();
  const view = useViewStore((state) => state.view);
  const showScreen = useHudScreen();
  useKeyboardInset();
  const forced = view === "intro" || view === "notice";

  return (
    <div className={styles.hud} data-screen={showScreen}>
      <div className={styles.hints}>
        {/* Standing up is no use while the desktop covers the office. */}
        {!showScreen && <PostureHint />}
        {touch && !forced && <ScreenToggle />}
      </div>

      {/* Phones cannot use the 3D monitor for typing, so the desktop (with its touch field) fills the screen instead. */}
      {showScreen && (
        <div className={styles.desktop}>
          <Desktop current={current} typingField={<TypingSink />} />
        </div>
      )}
    </div>
  );
}
