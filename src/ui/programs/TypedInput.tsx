// The "You typed" box showing the latest keys, with wrong ones in red.
import { typedText, type TypingState } from "@/game/text/typing";
import styles from "./TypedInput.module.css";

// How much of the end of the typed text to show, so the latest keys are always visible.
const VISIBLE_CHARS = 40;

// Shows exactly what the player has typed, like TypeRacer's input box. Mistakes appear here as the
// real key that was pressed (not the character that was expected), which is what makes them easy to spot.
export default function TypedInput({ typing }: { typing: TypingState }) {
  const typed = typedText(typing);
  const start = Math.max(0, typed.length - VISIBLE_CHARS);
  const correct = typed.slice(start, typing.cursor);

  return (
    // The hint below the text announces mistakes to screen readers, so this stays out of the way.
    <div className={styles.input} aria-hidden="true">
      <span className={styles.label}>You typed</span>
      <span className={styles.typed}>
        {start > 0 && <span className={styles.placeholder}>...</span>}
        {typed === "" && <span className={styles.placeholder}>Start typing</span>}
        <span className={styles.correct}>{correct}</span>
        <span className={styles.wrong}>{typing.wrong}</span>
        <span className={styles.caret} />
      </span>
    </div>
  );
}
