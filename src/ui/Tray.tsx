// The status tray at the end of the task bar: always-visible credits and live typing speed.
import { CURRENCY } from "@/game/currency";
import { formatNumber, formatRate } from "@/game/economy";
import { assistantRate } from "@/game/progress";
import { liveWpm } from "@/game/typing";
import { useGameStore } from "@/state/gameStore";
import type { CurrentAssignment } from "@/state/useCurrentAssignment";
import styles from "./Tray.module.css";

export default function Tray({ current }: { current: CurrentAssignment }) {
  const currency = useGameStore((state) => state.player.currency);
  const wpm = Math.round(liveWpm(current.typing, current.now));
  const rate = useGameStore(assistantRate);

  return (
    <div className={styles.tray}>
      <span className={styles.item} title={CURRENCY.name}>
        {CURRENCY.symbol}
        {formatNumber(currency)}
      </span>
      {rate > 0 && (
        <span className={styles.item} title="Earned by your AI assistant, per second">
          +{formatRate(rate)}/s
        </span>
      )}
      <span className={styles.item} title="Words per minute">
        {wpm} WPM
      </span>
    </div>
  );
}
