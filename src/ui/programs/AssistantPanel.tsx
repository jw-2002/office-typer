// The assistant program: the AI assistant you are using, what it earns, and a live view of it typing.
import { CURRENCY } from "@/game/economy/currency";
import type { AssistantSpec, Upgrade } from "@/game/data/upgrades";
import { formatRate } from "@/game/economy/economy";
import { assistantRate } from "@/game/progress/gameplay";
import { currentJob } from "@/game/progress/progress";
import { useAssistantTyping } from "@/state/assignment/useAssistantTyping";
import { useEquipped, useGameStore } from "@/state/game/gameStore";
import Button from "@/ui/shared/Button";
import Money from "@/ui/shared/Money";
import styles from "./AssistantPanel.module.css";

/** The live typing view. Remounted for each assistant (by its key), so a new one starts fresh. */
function AssistantScreen({ assistant, tier }: { assistant: AssistantSpec; tier: number }) {
  const { typed } = useAssistantTyping(assistant, tier);
  return (
    <p className={styles.screen} aria-label="What the assistant is typing">
      {typed}
      <span className={styles.caret} />
    </p>
  );
}

type AssistantPanelProps = {
  /** Switches to the shop, where assistants are bought. */
  onOpenShop: () => void;
};

export default function AssistantPanel({ onOpenShop }: AssistantPanelProps) {
  const upgrade: Upgrade | undefined = useEquipped("assistant");
  const tier = useGameStore((state) => currentJob(state).assignmentTier);
  const rate = useGameStore(assistantRate);
  const waiting = useGameStore((state) => state.finale.stage === "pending");

  if (!upgrade?.assistant) {
    return (
      <div className={styles.empty}>
        <p>You do not have an AI assistant yet. It types on its own, earning {CURRENCY.name} while you work.</p>
        <Button onClick={onOpenShop}>See the shop</Button>
      </div>
    );
  }

  return (
    <div className={styles.assistant}>
      <div className={styles.top}>
        <div>
          <h3 className={styles.name}>{upgrade.name}</h3>
          <p className={styles.description}>{upgrade.description}</p>
        </div>
        <dl className={styles.facts}>
          <dt>Speed</dt>
          <dd>{upgrade.assistant.wpm} WPM</dd>
          <dt>Accuracy</dt>
          <dd>{Math.round(upgrade.assistant.accuracy * 100)}%</dd>
          <dt>Earning</dt>
          <dd>
            <Money amount={rate} text={`${formatRate(rate)}/s`} />
          </dd>
        </dl>
      </div>

      {waiting && (
        <p className={styles.warning} role="status">
          {upgrade.name} is settling in at your desk. Someone from HR has been seen looking at you.
        </p>
      )}

      <AssistantScreen key={upgrade.id} assistant={upgrade.assistant} tier={tier} />
    </div>
  );
}
