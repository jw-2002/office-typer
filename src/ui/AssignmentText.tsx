import type { TypingState } from "@/game/typing";
import styles from "./AssignmentText.module.css";

// Splits the target into typed, current and remaining text. A mistake is shown on the current
// character with an underline as well as colour, so it does not rely on colour alone.
export default function AssignmentText({ typing }: { typing: TypingState }) {
  const { target, cursor, wrongKey } = typing;
  const hasCurrent = cursor < target.length;

  return (
    <p className={styles.text} aria-label="Assignment text">
      <span className={styles.done}>{target.slice(0, cursor)}</span>
      {hasCurrent && <span className={wrongKey === null ? styles.current : styles.error}>{target[cursor]}</span>}
      <span className={styles.todo}>{target.slice(cursor + 1)}</span>
    </p>
  );
}
