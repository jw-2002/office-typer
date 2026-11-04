// The assignment itself: length choice, live readout, the text, what you typed, and the result line. Sits in the Desktop window.
import type { ReactNode } from "react";
import { LENGTH_TARGETS, type AssignmentLength } from "@/game/assignments";
import { CURRENCY } from "@/game/currency";
import { LENGTH_PAY, formatNumber } from "@/game/economy";
import { accuracy, elapsedMs } from "@/game/typing";
import { useGameStore } from "@/state/gameStore";
import type { CurrentAssignment } from "@/state/useCurrentAssignment";
import AssignmentText from "./AssignmentText";
import Button from "./Button";
import TypedInput from "./TypedInput";
import styles from "./AssignmentPanel.module.css";

const lengths = Object.keys(LENGTH_TARGETS) as AssignmentLength[];
const capitalise = (word: string) => word[0].toUpperCase() + word.slice(1);
/** Extra pay for a length, as a percentage: 1.2 becomes 20. */
const bonusPercent = (length: AssignmentLength) => Math.round((LENGTH_PAY[length] - 1) * 100);

// Takes everything as props, not from context: the monitor renders this inside a separate React root
// (drei's <Html>), where React context is not available. The Zustand store still works there.
type AssignmentPanelProps = {
  current: CurrentAssignment;
  /** Extra content at the end of the panel, such as the touch typing field. */
  children?: ReactNode;
};

export default function AssignmentPanel({ current, children }: AssignmentPanelProps) {
  const { typing, now, length, finished, capsLock, chooseLength, next } = current;
  const lastReward = useGameStore((state) => state.lastReward);

  const hint =
    finished && lastReward
      ? `Assignment complete. +${CURRENCY.symbol}${formatNumber(lastReward.payout)}` +
        (lastReward.promotedTo ? ` Promoted to ${lastReward.promotedTo.title}!` : "")
      : typing.wrong !== ""
        ? "Mistake. Press Backspace to remove the red text."
        : "";

  return (
    <section className={styles.panel}>
      <div className={styles.top}>
        <div className={styles.lengths} role="group" aria-label="Assignment length">
          {lengths.map((option) => (
            <Button
              key={option}
              aria-pressed={option === length}
              title={bonusPercent(option) > 0 ? `Pays ${bonusPercent(option)}% more per character` : "The quick one"}
              onClick={() => chooseLength(option)}
            >
              {capitalise(option)}
              {bonusPercent(option) > 0 && ` +${bonusPercent(option)}%`}
            </Button>
          ))}
        </div>
        <p className={styles.readout}>
          <span>Accuracy {Math.round(accuracy(typing) * 100)}%</span>
          <span>Time {(elapsedMs(typing, now) / 1000).toFixed(1)}s</span>
        </p>
      </div>

      {capsLock && (
        <p className={styles.warning} role="status">
          Caps Lock is on
        </p>
      )}

      <AssignmentText typing={typing} />
      <TypedInput typing={typing} />

      <div className={styles.footer}>
        <p className={styles.hint} aria-live="polite">
          {hint}
        </p>
        {finished && <Button onClick={next}>Next assignment (Enter)</Button>}
      </div>

      {children}
    </section>
  );
}
