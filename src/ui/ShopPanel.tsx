// The upgrade shop: every upgrade grouped by category, bought through one generic action.
import { categoryLabels, upgrades, type UpgradeCategory } from "@/game/data/upgrades";
import { buyStatus } from "@/game/progress";
import { useGameStore } from "@/state/gameStore";
import UpgradeCard from "./UpgradeCard";
import styles from "./ShopPanel.module.css";

const categories = Object.keys(categoryLabels) as UpgradeCategory[];

export default function ShopPanel() {
  // The store state is a valid Progress, so it can go straight into the rules.
  const progress = useGameStore();
  const buy = useGameStore((state) => state.buy);

  return (
    <section className={styles.shop} aria-label="Shop">
      <h2 className={styles.title}>Shop</h2>
      {categories.map((category) => (
        <div key={category}>
          <h3 className={styles.category}>{categoryLabels[category]}</h3>
          <ul className={styles.list}>
            {upgrades
              .filter((upgrade) => upgrade.category === category)
              .map((upgrade) => (
                <UpgradeCard
                  key={upgrade.id}
                  upgrade={upgrade}
                  status={buyStatus(progress, upgrade)}
                  onBuy={() => buy(upgrade.id)}
                />
              ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
