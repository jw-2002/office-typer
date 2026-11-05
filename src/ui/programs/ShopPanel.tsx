// The upgrade shop, shown as a program in the desktop window: every upgrade grouped by category.
import { categoryLabels, isEquippable, upgradeCategories, upgrades } from "@/game/data/upgrades";
import { buyStatus, isOnDesk } from "@/game/progress/shop";
import { useAudioStore } from "@/state/sound/audioStore";
import { useGameStore } from "@/state/game/gameStore";
import UpgradeCard from "./UpgradeCard";
import styles from "./ShopPanel.module.css";

export default function ShopPanel() {
  // The store state is a valid Progress, so it can go straight into the rules.
  const progress = useGameStore();
  const buy = useGameStore((state) => state.buy);
  const equip = useGameStore((state) => state.equip);
  const toggleStowed = useGameStore((state) => state.toggleStowed);
  const track = useAudioStore((state) => state.track);
  const setTrack = useAudioStore((state) => state.setTrack);

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
                  equipped={
                    upgrade.category === "music"
                      ? track === upgrade.id
                      : upgrade.category === "extra"
                        ? isOnDesk(progress, upgrade.id)
                        : isEquippable(upgrade.category) && progress.equipped[upgrade.category] === upgrade.id
                  }
                  onBuy={() => buy(upgrade.id)}
                  onEquip={() =>
                    upgrade.category === "music"
                      ? setTrack(upgrade.id)
                      : upgrade.category === "extra"
                        ? toggleStowed(upgrade.id)
                        : equip(upgrade.id)
                  }
                />
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
