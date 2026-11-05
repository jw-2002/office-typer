// The status tray at the end of the task bar: always-visible credits and live typing speed.
import { formatMultiplier, formatRate, overallMultiplier } from "@/game/economy/economy";
import { assistantRate } from "@/game/progress/gameplay";
import { currentJob } from "@/game/progress/progress";
import { goblinActive } from "@/game/progress/goblin";
import { liveWpm } from "@/game/text/typing";
import { useGameStore } from "@/state/game/gameStore";
import type { CurrentAssignment } from "@/state/assignment/useCurrentAssignment";
import Money from "@/ui/shared/Money";
import styles from "./Tray.module.css";

export default function Tray({ current }: { current: CurrentAssignment }) {
  const currency = useGameStore((state) => state.player.currency);
  const wpm = Math.round(liveWpm(current.typing, current.now));
  const rate = useGameStore(assistantRate);
  const job = useGameStore(currentJob);
  const owned = useGameStore((state) => state.upgrades);
  const streak = useGameStore((state) => state.stats.streak);
  const goblin = useGameStore(goblinActive);
  const legacy = useGameStore((state) => state.legacy);
  const multiplier = overallMultiplier(job, owned, streak, goblin, legacy);

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
