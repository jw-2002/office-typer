// The colour of each key switch. It shows as the switch housing under the keycaps, and as the highlight when
// a key is pressed. Keyed by upgrade id, so a new switch will not compile until it has a colour.
import type { SwitchId } from "@/game/data/upgrades";

// Typed as a plain string record so callers can look up the id of any owned upgrade, with a check here that
// every switch is covered.
export const switchColors: Readonly<Record<string, string>> = {
  mushy: "#eab308",
  strawberry: "#ef4444",
  chestnut: "#c2610c",
  blueberry: "#3b82f6",
} satisfies Record<SwitchId, string>;

/** Used if the id is unknown, for example a save from a newer version. */
export const DEFAULT_SWITCH_COLOR = "#f59e0b";
