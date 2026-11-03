import { LENGTH_TARGETS, type AssignmentLength } from "@/game/assignments";
import { accuracy, elapsedMs, liveWpm } from "@/game/typing";
import { useAssignment } from "@/hooks/useAssignment";
import { useCapsLock } from "@/hooks/useCapsLock";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import AssignmentText from "./AssignmentText";
import TypedInput from "./TypedInput";
import TypingSink from "./TypingSink";
import styles from "./Hud.module.css";

const lengths = Object.keys(LENGTH_TARGETS) as AssignmentLength[];
const capitalise = (word: string) => word[0].toUpperCase() + word.slice(1);

// Stops a button taking focus, so Space and Enter keep going to the typing game.
const keepFocus = (event: { preventDefault: () => void }) => event.preventDefault();

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

export default function Hud() {
  const { assignment, typing, length, now, finished, chooseLength, next } = useAssignment(0);
  const capsLock = useCapsLock();
  const touch = useCoarsePointer();
  useKeyboardInset();
  const seconds = elapsedMs(typing, now) / 1000;

  return (
    <div className={styles.hud}>
      <div className={styles.stats}>
        <Stat label="WPM" value={Math.round(liveWpm(typing, now)).toString()} />
        <Stat label="Accuracy" value={`${Math.round(accuracy(typing) * 100)}%`} />
        <Stat label="Time" value={`${seconds.toFixed(1)}s`} />
        {capsLock && (
          <p className={styles.warning} role="status">
            Caps Lock is on
          </p>
        )}
      </div>

      <div className={styles.bottom}>
        <section className={styles.panel}>
          <header className={styles.header}>
            <h1 className={styles.title}>{assignment.title}</h1>
            <div className={styles.lengths}>
              {lengths.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={styles.button}
                  aria-pressed={option === length}
                  onMouseDown={keepFocus}
                  onClick={() => chooseLength(option)}
                >
                  {capitalise(option)}
                </button>
              ))}
            </div>
          </header>

          <AssignmentText typing={typing} />

          <div className={styles.footer}>
            <p className={styles.hint} aria-live="polite">
              {finished
                ? "Assignment complete."
                : typing.wrong !== ""
                  ? "Mistake. Press Backspace to remove the red text."
                  : ""}
            </p>
            {finished && (
              <button type="button" className={styles.button} onMouseDown={keepFocus} onClick={next}>
                Next assignment (Enter)
              </button>
            )}
          </div>

          {touch && <TypingSink />}
        </section>
        <TypedInput typing={typing} />
      </div>
    </div>
  );
}
