// The status tray at the end of the task bar: always-visible credits and live typing speed.
import { formatMultiplier, formatRate, overallMultiplier } from "@/game/economy";
import { assistantRate, currentJob, goblinActive } from "@/game/progress";
import { liveWpm } from "@/game/typing";
import { useGameStore } from "@/state/gameStore";
import type { CurrentAssignment } from "@/state/useCurrentAssignment";
import Money from "./Money";
import styles from "./Tray.module.css";

export default function Tray({ current }: { current: CurrentAssignment }) {
  const currency = useGameStore((state) => state.player.currency);
  const wpm = Math.round(liveWpm(current.typing, current.now));
  const rate = useGameStore(assistantRate);
  const job = useGameStore(currentJob);
  const owned = useGameStore((state) => state.upgrades);
  const streak = useGameStore((state) => state.stats.streak);
  const goblin = useGameStore(goblinActive);
  const multiplier = overallMultiplier(job, owned, streak, goblin);

  return (
    <div className={styles.tray}>
      <span className={styles.item}>
        <Money amount={currency} />
      </span>
      <span className={styles.item} title="Your pay multiplier: job, upgrades, clean streak and goblin mode together">
        x{formatMultiplier(multiplier)}
      </span>
      {rate > 0 && (
        <span className={styles.item} title="Earned by your AI assistant, per second">
          +<Money amount={rate} text={`${formatRate(rate)}/s`} />
        </span>
      )}
      <span className={styles.item} title="Words per minute">
        {wpm} WPM
      </span>
    </div>
  );
}
