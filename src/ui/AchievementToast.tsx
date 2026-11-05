// A small pop-up when an achievement is earned. It goes away by itself after a few seconds.
import { useEffect } from "react";
import { achievements } from "@/game/data/achievements";
import { useGameStore } from "@/state/gameStore";
import { useSoundCueStore } from "@/state/soundCueStore";
import styles from "./AchievementToast.module.css";

const SHOW_MS = 4500;

export default function AchievementToast() {
  const earned = useGameStore((state) => state.justEarned);
  const dismiss = useGameStore((state) => state.dismissEarned);

  useEffect(() => {
    if (earned.length === 0) return;
    useSoundCueStore.getState().play("ping");
    const id = setTimeout(dismiss, SHOW_MS);
    return () => clearTimeout(id);
  }, [earned, dismiss]);

  if (earned.length === 0) return null;
  const first = achievements.find((achievement) => achievement.id === earned[0]);
  return (
    <div className={styles.toast} role="status">
      <span className={styles.label}>Achievement</span>
      <strong>{first?.name}</strong>
      <span>{first?.description}</span>
      {earned.length > 1 && <span className={styles.more}>and {earned.length - 1} more</span>}
    </div>
  );
}
