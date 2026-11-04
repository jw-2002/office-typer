// The assignment itself: length choice, the text, and the result line. It sits inside the Desktop window.
import type { ReactNode } from "react";
import { LENGTH_TARGETS, type AssignmentLength } from "@/game/assignments";
import { CURRENCY } from "@/game/currency";
import { formatNumber } from "@/game/economy";
import { useGameStore } from "@/state/gameStore";
import type { CurrentAssignment } from "@/state/useCurrentAssignment";
import AssignmentText from "./AssignmentText";
import Button from "./Button";
import styles from "./AssignmentPanel.module.css";

const lengths = Object.keys(LENGTH_TARGETS) as AssignmentLength[];
const capitalise = (word: string) => word[0].toUpperCase() + word.slice(1);

// Takes everything as props, not from context: the monitor renders this inside a separate React root
// (drei's <Html>), where React context is not available. The Zustand store still works there.
type AssignmentPanelProps = {
  current: CurrentAssignment;
  /** Extra content at the end of the panel, such as the touch typing field. */
  children?: ReactNode;
};

export default function AssignmentPanel({ current, children }: AssignmentPanelProps) {
  const { typing, length, finished, chooseLength, next } = current;
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
      <div className={styles.lengths} role="group" aria-label="Assignment length">
        {lengths.map((option) => (
          <Button key={option} aria-pressed={option === length} onClick={() => chooseLength(option)}>
            {capitalise(option)}
          </Button>
        ))}
      </div>

      <AssignmentText typing={typing} />

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
