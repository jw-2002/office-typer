// The 2D overlay: stats, shop and the typed-text box. On touch devices it also holds the assignment panel.
import { useState } from "react";
import { CURRENCY } from "@/game/currency";
import { formatNumber, nextJob } from "@/game/economy";
import { currentJob } from "@/game/progress";
import { accuracy, elapsedMs, liveWpm } from "@/game/typing";
import { useCapsLock } from "@/hooks/useCapsLock";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { useGameStore } from "@/state/gameStore";
import { useCurrentAssignment } from "@/state/useCurrentAssignment";
import AssignmentPanel from "./AssignmentPanel";
import Button from "./Button";
import ShopPanel from "./ShopPanel";
import TypedInput from "./TypedInput";
import TypingSink from "./TypingSink";
import styles from "./Hud.module.css";

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
  const job = useGameStore(currentJob);
  const promotion = nextJob(job);

  const current = useCurrentAssignment();
  const { typing, now } = current;
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
        {/* Phones cannot use the 3D monitor for typing, so the panel (with its touch field) sits here instead. */}
        {touch && (
          <AssignmentPanel current={current}>
            <TypingSink />
          </AssignmentPanel>
        )}
        <TypedInput typing={typing} />
      </div>
    </div>
  );
}
