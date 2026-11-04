// A hint to the goblin mode easter egg (the goblin poster on the wall), in green. Once found, it says when it is ready.
import { formatDuration } from "@/game/economy";
import { useGameStore } from "@/state/gameStore";
import GoblinText from "./GoblinText";

export default function GoblinHint({ className }: { className?: string }) {
  const uses = useGameStore((state) => state.stats.goblinUses);
  const cooldown = useGameStore((state) => state.goblin.cooldown);
  const active = useGameStore((state) => state.goblin.active > 0);

  const text =
    uses === 0
      ? "Psst. The goblin of the month on the wall is not just a poster. Give it a poke."
      : active
        ? "Goblin mode is on. Type fast."
        : cooldown > 0
          ? `Goblin mode is ready again in ${formatDuration(Math.ceil(cooldown))}.`
          : "Goblin mode is ready. The goblin is waiting.";
  return (
    <p className={className}>
      <GoblinText>{text}</GoblinText>
    </p>
  );
}
