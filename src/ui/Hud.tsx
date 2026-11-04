// The 2D overlay: stats and the typed-text box. On touch devices it also holds the desktop (assignment and shop).
import { CURRENCY } from "@/game/currency";
import { formatNumber, nextJob } from "@/game/economy";
import { currentJob } from "@/game/progress";
import { accuracy, elapsedMs, liveWpm } from "@/game/typing";
import { useCapsLock } from "@/hooks/useCapsLock";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { useAudio } from "@/state/useAudio";
import { useGameStore } from "@/state/gameStore";
import { useCurrentAssignment } from "@/state/useCurrentAssignment";
import Button from "./Button";
import Desktop from "./Desktop";
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
  const { muted, setMuted } = useAudio();
  const touch = useCoarsePointer();
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
        <Button aria-pressed={!muted} onClick={() => setMuted(!muted)}>
          Sound
        </Button>
        {capsLock && (
          <p className={styles.warning} role="status">
            Caps Lock is on
          </p>
        )}
      </div>

      <div className={styles.bottom}>
        {/* Phones cannot use the 3D monitor for typing, so the desktop (with its touch field) sits here instead. */}
        {touch && (
          <div className={styles.desktop}>
            <Desktop current={current} typingField={<TypingSink />} />
          </div>
        )}
        <TypedInput typing={typing} />
      </div>
    </div>
  );
}
