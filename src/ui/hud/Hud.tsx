// The 2D overlay: the stand up / sit down hint, and on touch devices the whole desktop (the 3D monitor is no use for typing there).
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { useCurrentAssignment } from "@/state/assignment/useCurrentAssignment";
import Desktop from "@/ui/desktop/Desktop";
import PostureHint from "./PostureHint";
import TypingSink from "@/ui/programs/TypingSink";
import styles from "./Hud.module.css";

export default function Hud() {
  const current = useCurrentAssignment();
  const touch = useCoarsePointer();
  useKeyboardInset();

  return (
    <div className={styles.hud}>
      <PostureHint />

      {/* Phones cannot use the 3D monitor for typing, so the desktop (with its touch field) sits here instead. */}
      {touch && (
        <div className={styles.desktop}>
          <Desktop current={current} typingField={<TypingSink />} />
        </div>
      )}
    </div>
  );
}
