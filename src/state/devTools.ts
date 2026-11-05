// Testing helpers, only in the dev server (never in the built game): type `officeTyper.give(100000)` in the browser console
// for some money, or `officeTyper.event()` to bring the next office event round straight away.
import { useEventStore } from "./eventStore";
import { useGameStore } from "./gameStore";

if (import.meta.env.DEV) {
  Object.assign(window, {
    officeTyper: {
      give: (amount: number) =>
        useGameStore.setState((state) => ({ player: { ...state.player, currency: state.player.currency + amount } })),
      event: () => useEventStore.setState({ secondsUntilNext: 0 }),
    },
  });
}
