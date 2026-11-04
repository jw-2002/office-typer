// The 2D overlay: stats, the assignment panel, length choice, the typed-text box and the shop.
import { useState } from "react";
import { LENGTH_TARGETS, type AssignmentLength } from "@/game/assignments";
import { CURRENCY } from "@/game/currency";
import { formatNumber, nextJob } from "@/game/economy";
import { currentJob } from "@/game/progress";
import { accuracy, elapsedMs, liveWpm } from "@/game/typing";
import { useAssignment } from "@/hooks/useAssignment";
import { useCapsLock } from "@/hooks/useCapsLock";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { useGameStore } from "@/state/gameStore";
import AssignmentText from "./AssignmentText";
import Button from "./Button";
import ShopPanel from "./ShopPanel";
import TypedInput from "./TypedInput";
import TypingSink from "./TypingSink";
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
  const currency = useGameStore((state) => state.player.currency);
  const totalChars = useGameStore((state) => state.stats.totalChars);
  const bestWpm = useGameStore((state) => state.stats.bestWpm);
  const lastReward = useGameStore((state) => state.lastReward);
  const job = useGameStore(currentJob);
  const promotion = nextJob(job);

  const { assignment, typing, length, now, finished, chooseLength, next } = useAssignment(job.assignmentTier);
  const capsLock = useCapsLock();
  const touch = useCoarsePointer();
  const [shopOpen, setShopOpen] = useState(false);
  useKeyboardInset();
  const seconds = elapsedMs(typing, now) / 1000;

  return (
    <div className={styles.hud}>
      <div className={styles.stats}>
        <Stat label={CURRENCY.name} value={`${CURRENCY.symbol}${formatNumber(currency)}`} />
        <Stat label="Job" value={job.title} />
        {promotion && <Stat label="Chars to promotion" value={formatNumber(promotion.minChars - totalChars)} />}
        <Stat label="WPM" value={Math.round(liveWpm(typing, now)).toString()} />
        <Stat label="Accuracy" value={`${Math.round(accuracy(typing) * 100)}%`} />
        <Stat label="Time" value={`${seconds.toFixed(1)}s`} />
        <Stat label="Best WPM" value={Math.round(bestWpm).toString()} />
        {capsLock && (
          <p className={styles.warning} role="status">
            Caps Lock is on
          </p>
        )}
        <Button aria-pressed={shopOpen} onClick={() => setShopOpen((open) => !open)}>
          Shop
        </Button>
      </div>

      {shopOpen && <ShopPanel />}

      <div className={styles.bottom}>
        <section className={styles.panel}>
          <header className={styles.header}>
            <h1 className={styles.title}>{assignment.title}</h1>
            <div className={styles.lengths}>
              {lengths.map((option) => (
                <Button key={option} aria-pressed={option === length} onClick={() => chooseLength(option)}>
                  {capitalise(option)}
                </Button>
              ))}
            </div>
          </header>

          <AssignmentText typing={typing} />

          <div className={styles.footer}>
            <p className={styles.hint} aria-live="polite">
              {finished && lastReward
                ? `Assignment complete. +${CURRENCY.symbol}${formatNumber(lastReward.payout)}` +
                  (lastReward.promotedTo ? ` Promoted to ${lastReward.promotedTo.title}!` : "")
                : typing.wrong !== ""
                  ? "Mistake. Press Backspace to remove the red text."
                  : ""}
            </p>
            {finished && <Button onClick={next}>Next assignment (Enter)</Button>}
          </div>

          {touch && <TypingSink />}
        </section>
        <TypedInput typing={typing} />
      </div>
    </div>
  );
}
