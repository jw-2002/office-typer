// The 2D overlay: the camera view button, and on touch devices the whole desktop (the 3D monitor is no use for typing there).
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { useCurrentAssignment } from "@/state/useCurrentAssignment";
import { useViewStore } from "@/state/viewStore";
import Button from "./Button";
import Desktop from "./Desktop";
import TypingSink from "./TypingSink";
import styles from "./Hud.module.css";

export default function Hud() {
  const current = useCurrentAssignment();
  const touch = useCoarsePointer();
  const view = useViewStore((state) => state.view);
  const setView = useViewStore((state) => state.setView);
  useKeyboardInset();

  return (
    <div className={styles.hud}>
      <div className={styles.corner}>
        <Button onClick={() => setView(view === "desk" ? "office" : "desk")}>
          {view === "desk" ? "Look around" : "Back to desk"}
        </Button>
      </div>

      {/* Phones cannot use the 3D monitor for typing, so the desktop (with its touch field) sits here instead. */}
      {touch && (
        <div className={styles.desktop}>
          <Desktop current={current} typingField={<TypingSink />} />
        </div>
      )}
    </div>
  );
}
