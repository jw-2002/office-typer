// One upgrade in the shop: name, effect, cost and a buy button. The same card is used for every upgrade.
import { CURRENCY } from "@/game/currency";
import type { Upgrade } from "@/game/data/upgrades";
import { formatNumber } from "@/game/economy";
import type { BuyStatus } from "@/game/progress";
import Button from "./Button";
import styles from "./UpgradeCard.module.css";

type UpgradeCardProps = { upgrade: Upgrade; status: BuyStatus; onBuy: () => void };

const buttonLabels: Record<BuyStatus, string> = {
  ok: "Buy",
  owned: "Owned",
  locked: "Locked",
  "too-expensive": "Buy",
};

export default function UpgradeCard({ upgrade, status, onBuy }: UpgradeCardProps) {
  return (
    <li className={styles.card} data-status={status}>
      <div className={styles.info}>
        <span className={styles.name}>{upgrade.name}</span>
        <span className={styles.description}>{upgrade.description}</span>
        <span className={styles.effect}>
          x{upgrade.payoutMultiplier} pay
          {upgrade.cost > 0 && ` - ${CURRENCY.symbol}${formatNumber(upgrade.cost)}`}
        </span>
      </div>
      <Button disabled={status !== "ok"} onClick={onBuy}>
        {buttonLabels[status]}
      </Button>
    </li>
  );
}
