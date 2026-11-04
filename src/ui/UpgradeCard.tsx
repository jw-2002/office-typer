// One upgrade in the shop: name, effect, cost and a button to buy it, or to switch to it once owned. Used for every upgrade.
import { CURRENCY } from "@/game/currency";
import type { Upgrade } from "@/game/data/upgrades";
import { formatNumber } from "@/game/economy";
import type { BuyStatus } from "@/game/progress";
import Button from "./Button";
import styles from "./UpgradeCard.module.css";

type UpgradeCardProps = {
  upgrade: Upgrade;
  status: BuyStatus;
  /** Whether this is the upgrade in use in its category. */
  equipped: boolean;
  onBuy: () => void;
  onEquip: () => void;
};

export default function UpgradeCard({ upgrade, status, equipped, onBuy, onEquip }: UpgradeCardProps) {
  const owned = status === "owned";

  return (
    <li className={styles.card} data-status={status} data-equipped={equipped}>
      <div className={styles.info}>
        <span className={styles.name}>{upgrade.name}</span>
        <span className={styles.description}>{upgrade.description}</span>
        <span className={styles.effect}>
          {upgrade.assistant
            ? `${upgrade.assistant.wpm} WPM, ${Math.round(upgrade.assistant.accuracy * 100)}% accurate`
            : `x${upgrade.payoutMultiplier} pay`}
          {upgrade.cost > 0 && ` - ${CURRENCY.symbol}${formatNumber(upgrade.cost)}`}
        </span>
      </div>
      {owned ? (
        // Owned upgrades can be swapped between. Only the best one earns the pay bonus, whichever is in use.
        <Button aria-pressed={equipped} disabled={equipped} onClick={onEquip}>
          {equipped ? "In use" : "Use"}
        </Button>
      ) : (
        <Button disabled={status !== "ok"} onClick={onBuy}>
          {status === "locked" ? "Locked" : "Buy"}
        </Button>
      )}
    </li>
  );
}
