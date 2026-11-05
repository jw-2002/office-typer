// The green glow over the whole screen while goblin mode is on, with a badge counting down the seconds left.
import { GOBLIN_MULTIPLIER, formatDuration } from "@/game/economy/economy";
import { useGameStore } from "@/state/game/gameStore";
import styles from "./GoblinOverlay.module.css";

export default function GoblinOverlay() {
  const active = useGameStore((state) => state.goblin.active);
  if (active <= 0) return null;
  return (
    <div className={styles.overlay} aria-hidden="true">
      <p className={styles.badge}>
        GOBLIN MODE x{GOBLIN_MULTIPLIER} - {formatDuration(Math.ceil(active))}
      </p>
    </div>
  );
}
