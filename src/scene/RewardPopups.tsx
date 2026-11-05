// A "+credits" number that floats up from the desk each time you finish an assignment.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { CURRENCY } from "@/game/currency";
import { formatNumber } from "@/game/economy";
import { useGameStore } from "@/state/gameStore";
import { DESK_HEIGHT } from "./palette";

const LIFETIME_SECONDS = 1.8;
const RISE = 0.28;

/** One floating number. It is created fresh for each finished assignment (see the key below), so it starts at zero age. */
function Popup({ text, goblin }: { text: string; goblin: boolean }) {
  const label = useRef<{ fillOpacity: number; outlineOpacity: number; position: { y: number } } | null>(null);
  const age = useRef(0);

  useFrame((_, delta) => {
    if (!label.current || age.current >= LIFETIME_SECONDS) return;
    age.current += delta;
    const t = Math.min(1, age.current / LIFETIME_SECONDS);
    // Rises quickly at first and slows down, and fades out over the last half.
    label.current.position.y = DESK_HEIGHT + 0.12 + RISE * (1 - (1 - t) ** 2);
    const opacity = t < 0.5 ? 1 : 1 - (t - 0.5) * 2;
    label.current.fillOpacity = opacity;
    label.current.outlineOpacity = opacity;
  });

  return (
    <Text
      ref={label as never}
      raycast={() => null}
      position={[0.3, DESK_HEIGHT + 0.12, 0.04]}
      fontSize={goblin ? 0.075 : 0.06}
      color={goblin ? "#39ff14" : "#fde047"}
      outlineWidth={0.006}
      outlineColor={goblin ? "#04200a" : "#22160e"}
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}

export default function RewardPopups() {
  const reward = useGameStore((state) => state.lastReward);
  // A new key for every finished assignment makes React start a new popup, so each one animates from the beginning.
  const finished = useGameStore((state) => state.stats.assignmentsCompleted);
  if (!reward || reward.payout <= 0) return null;
  const amount = `+${CURRENCY.symbol}${formatNumber(reward.payout)}`;
  return <Popup key={finished} text={reward.goblin ? `GOBBLE! ${amount}` : amount} goblin={reward.goblin} />;
}
