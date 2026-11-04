// Shows the assignment text with done, wrong, current and remaining parts styled.
import type { TypingState } from "@/game/typing";
import styles from "./AssignmentText.module.css";

// Splits the target into done, wrong, current and remaining text. The wrong stretch covers the
// characters the player has typed since their first mistake, and is underlined as well as red so it
// does not rely on colour alone.
export default function AssignmentText({ typing }: { typing: TypingState }) {
  const { target, cursor, wrong } = typing;
  const wrongEnd = cursor + wrong.length;

  return (
    <p className={styles.text} aria-label="Assignment text">
      <span className={styles.done}>{target.slice(0, cursor)}</span>
      <span className={styles.error}>{target.slice(cursor, wrongEnd)}</span>
      {wrongEnd < target.length && <span className={styles.current}>{target[wrongEnd]}</span>}
      <span className={styles.todo}>{target.slice(wrongEnd + 1)}</span>
    </p>
  );
}
