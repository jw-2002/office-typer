// A themed progress bar. `value` runs from 0 to 1.
import { clamp01 } from "@/game/utils/math";
import styles from "./ProgressBar.module.css";

export default function ProgressBar({ value, label }: { value: number; label: string }) {
  const percent = Math.round(clamp01(value) * 100);
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div className={styles.fill} style={{ width: `${percent}%` }} />
    </div>
  );
}
