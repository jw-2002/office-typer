// An invisible text field over the assignment that opens the phone keyboard and feeds keys in.
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { diffToKeys } from "@/state/diffToKeys";
import { useKeyInput } from "@/state/useKeyInput";
import styles from "./TypingSink.module.css";

// The field always holds one space. A space to delete is what lets us see Backspace on a phone, because
// deleting from an empty field produces no event at all.
const SENTINEL = " ";

/**
 * A transparent text field laid over its parent, so tapping the assignment brings up the on-screen
 * keyboard. We watch what changes in the field rather than key events, because phone keyboards often
 * report every key as "Unidentified". Only rendered on touch devices.
 */
export default function TypingSink() {
  const input = useKeyInput();
  const [focused, setFocused] = useState(false);

  const handleInput = (event: FormEvent<HTMLInputElement>) => {
    const field = event.currentTarget;
    diffToKeys(SENTINEL, field.value).forEach((key) => input.press(key));
    field.value = SENTINEL;
    field.setSelectionRange(SENTINEL.length, SENTINEL.length);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // A hardware keyboard on a tablet also reaches the window listener, which would type every key twice.
    event.stopPropagation();
    // Enter changes nothing in the field, so it has to be forwarded by hand.
    if (event.key === "Enter") {
      event.preventDefault();
      input.press("Enter");
    }
  };

  return (
    <>
      <input
        className={styles.sink}
        aria-label="Type the assignment here"
        defaultValue={SENTINEL}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="enter"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={(event) => {
          setFocused(true);
          // Keep the caret after the space, so Backspace always has something to delete.
          event.currentTarget.setSelectionRange(SENTINEL.length, SENTINEL.length);
        }}
        onBlur={() => setFocused(false)}
        onSelect={(event) => event.currentTarget.setSelectionRange(SENTINEL.length, SENTINEL.length)}
      />
      {!focused && <span className={styles.prompt}>Tap here to type</span>}
    </>
  );
}
