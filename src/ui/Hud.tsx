import { LENGTH_TARGETS, type AssignmentLength } from "@/game/assignments";
import { accuracy, elapsedMs, liveWpm } from "@/game/typing";
import { useAssignment } from "@/hooks/useAssignment";
import AssignmentText from "./AssignmentText";
import styles from "./Hud.module.css";

const lengths = Object.keys(LENGTH_TARGETS) as AssignmentLength[];
const capitalise = (word: string) => word[0].toUpperCase() + word.slice(1);

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

export default function Hud() {
  const { assignment, typing, length, now, finished, chooseLength } = useAssignment(0);
  const seconds = elapsedMs(typing, now) / 1000;

  return (
    <div className={styles.hud}>
      <div className={styles.stats}>
        <Stat label="WPM" value={Math.round(liveWpm(typing, now)).toString()} />
        <Stat label="Accuracy" value={`${Math.round(accuracy(typing) * 100)}%`} />
        <Stat label="Time" value={`${seconds.toFixed(1)}s`} />
      </div>

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
                // Stops the button taking focus, so Space and Enter keep going to the typing game.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseLength(option)}
              >
                {capitalise(option)}
              </button>
            ))}
          </div>
        </header>

        <AssignmentText typing={typing} />

        <p className={styles.hint} aria-live="polite">
          {finished
            ? "Assignment complete. Press Enter for the next one."
            : typing.wrongKey !== null
              ? "Wrong key. Press Backspace to fix it."
              : typing.startedAt === null
                ? "Start typing."
                : ""}
        </p>
      </section>
    </div>
  );
}
