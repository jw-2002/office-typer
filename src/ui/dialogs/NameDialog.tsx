// The welcome box shown on a new game: asks for the player's name, which then goes on the desk name plate.
import { useId, useState, type FormEvent } from "react";
import { MAX_NAME_LENGTH, cleanPlayerName } from "@/game/progress/progress";
import { useGameStore } from "@/state/game/gameStore";
import Button from "@/ui/shared/Button";
import Dialog, { DialogActions, DialogText } from "./Dialog";
import styles from "./NameDialog.module.css";

export default function NameDialog() {
  const messageId = useId();
  const setName = useGameStore((state) => state.setName);
  const [typed, setTyped] = useState("");
  const ready = cleanPlayerName(typed) !== "";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (ready) setName(typed);
  };

  return (
    <Dialog title="Welcome to the office" describedBy={messageId}>
      <form onSubmit={submit}>
        <DialogText id={messageId}>Your first day starts now. What should we put on your desk name plate?</DialogText>
        <input
          className={styles.field}
          aria-label="Your name"
          value={typed}
          maxLength={MAX_NAME_LENGTH}
          placeholder="Your name"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setTyped(event.target.value)}
          // The window listens for keys to type the assignment with, so keep these keys to the name box.
          onKeyDown={(event) => event.stopPropagation()}
          onKeyUp={(event) => event.stopPropagation()}
        />
        <DialogActions>
          <Button type="submit" disabled={!ready}>
            Start work
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
