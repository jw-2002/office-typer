// An office event: a card going round, a cake sale and so on. A few choices, some of which cost money that grows with your
// pay multiplier. After choosing, it says what happened and waits to be closed.
import { useId } from "react";
import { canAfford, choiceAmounts } from "@/game/events";
import { multiplierOf, useGameStore } from "@/state/gameStore";
import { useEventStore } from "@/state/eventStore";
import Button from "./Button";
import Dialog, { DialogActions, DialogText } from "./Dialog";
import Money from "./Money";
import styles from "./EventDialog.module.css";

export default function EventDialog() {
  const messageId = useId();
  const current = useEventStore((state) => state.current);
  const outcome = useEventStore((state) => state.outcome);
  const choose = useEventStore((state) => state.choose);
  const close = useEventStore((state) => state.close);
  // The whole store is a valid Progress, so it can go straight into the rules.
  const progress = useGameStore();
  if (!current) return null;
  const multiplier = multiplierOf(progress);

  return (
    <Dialog title={current.title} describedBy={messageId}>
      <DialogText id={messageId}>{outcome ?? current.text}</DialogText>
      {outcome === null ? (
        <ul className={styles.choices}>
          {current.choices.map(({ label, choice }, index) => {
            const { cost, gain } = choiceAmounts(choice, multiplier);
            return (
              <li key={label}>
                <Button disabled={!canAfford(progress, choice, multiplier)} onClick={() => choose(index)}>
                  {label}
                  {cost > 0 && (
                    <>
                      {" "}
                      <Money amount={cost} />
                    </>
                  )}
                  {gain > 0 && (
                    <>
                      {" +"}
                      <Money amount={gain} />
                    </>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <DialogActions>
          <Button onClick={close}>Back to work</Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
