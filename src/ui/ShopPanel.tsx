// The upgrade shop, shown as a program in the desktop window: every upgrade grouped by category.
import { categoryLabels, upgradeCategories, upgrades } from "@/game/data/upgrades";
import { buyStatus } from "@/game/progress";
import { useGameStore } from "@/state/gameStore";
import UpgradeCard from "./UpgradeCard";
import styles from "./ShopPanel.module.css";

export default function ShopPanel() {
  // The store state is a valid Progress, so it can go straight into the rules.
  const progress = useGameStore();
  const buy = useGameStore((state) => state.buy);
  const equip = useGameStore((state) => state.equip);

  return (
    <div className={styles.shop}>
      {upgradeCategories.map((category) => (
        <section key={category}>
          <h2 className={styles.category}>{categoryLabels[category]}</h2>
          <ul className={styles.list}>
            {upgrades
              .filter((upgrade) => upgrade.category === category)
              .map((upgrade) => (
                <UpgradeCard
                  key={upgrade.id}
                  upgrade={upgrade}
                  status={buyStatus(progress, upgrade)}
                  equipped={progress.equipped[upgrade.category] === upgrade.id}
                  onBuy={() => buy(upgrade.id)}
                  onEquip={() => equip(upgrade.id)}
                />
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
