// The status tray at the end of the task bar: always-visible credits and live typing speed.
import { CURRENCY } from "@/game/currency";
import { formatNumber } from "@/game/economy";
import { liveWpm } from "@/game/typing";
import { useGameStore } from "@/state/gameStore";
import type { CurrentAssignment } from "@/state/useCurrentAssignment";
import styles from "./Tray.module.css";

export default function Tray({ current }: { current: CurrentAssignment }) {
  const currency = useGameStore((state) => state.player.currency);
  const wpm = Math.round(liveWpm(current.typing, current.now));

  return (
    <div className={styles.tray}>
      <span className={styles.item} title={CURRENCY.name}>
        {CURRENCY.symbol}
        {formatNumber(currency)}
      </span>
      <span className={styles.item} title="Words per minute">
        {wpm} WPM
      </span>
    </div>
  );
}
