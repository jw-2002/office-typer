// The settings program: your record and career, the sound setting, and the reset (which asks for confirmation first).
import { CURRENCY } from "@/game/currency";
import { formatNumber, nextJob } from "@/game/economy";
import { currentJob } from "@/game/progress";
import { useAudioStore } from "@/state/audioStore";
import { useGameStore } from "@/state/gameStore";
import Button from "./Button";
import styles from "./SettingsPanel.module.css";

type SettingsPanelProps = {
  /** Asks the desktop to show the "are you sure?" box. The reset itself happens after the player confirms. */
  onRequestReset: () => void;
};

export default function SettingsPanel({ onRequestReset }: SettingsPanelProps) {
  const stats = useGameStore((state) => state.stats);
  const job = useGameStore(currentJob);
  const promotion = nextJob(job);
  const muted = useAudioStore((state) => state.muted);
  const setMuted = useAudioStore((state) => state.setMuted);

  return (
    <div className={styles.settings}>
      <section>
        <h3 className={styles.heading}>Your record</h3>
        <dl className={styles.stats}>
          <dt>Job</dt>
          <dd>{job.title}</dd>
          <dt>To next promotion</dt>
          <dd>{promotion ? `${formatNumber(promotion.minChars - stats.totalChars)} chars` : "Top of the ladder"}</dd>
          <dt>Assignments finished</dt>
          <dd>{formatNumber(stats.assignmentsCompleted)}</dd>
          <dt>Characters typed</dt>
          <dd>{formatNumber(stats.totalChars)}</dd>
          <dt>Highest WPM</dt>
          <dd>{Math.round(stats.bestWpm)}</dd>
          <dt>Earned in total</dt>
          <dd>
            {CURRENCY.symbol}
            {formatNumber(stats.totalEarned)}
          </dd>
        </dl>
      </section>

      <div className={styles.column}>
        <section>
          <h3 className={styles.heading}>Sound</h3>
          <Button aria-pressed={!muted} onClick={() => setMuted(!muted)}>
            {muted ? "Key sounds: off" : "Key sounds: on"}
          </Button>
        </section>

        <section>
          <h3 className={styles.heading}>Start again</h3>
          <p className={styles.text}>
            Erases your {CURRENCY.name}, upgrades, promotions and record, and starts over as an Intern. Your game is
            saved in this browser automatically, so this is the only way to wipe it.
          </p>
          <Button onClick={onRequestReset}>Reset game...</Button>
        </section>
      </div>
    </div>
  );
}
