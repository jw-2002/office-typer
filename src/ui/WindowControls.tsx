// The three window buttons: minimise, maximise and close. Their shape, colour and order follow the OS theme.
import styles from "./WindowControls.module.css";

const controls = [
  { role: "minimise", label: "Minimise window" },
  { role: "maximise", label: "Maximise window" },
  { role: "close", label: "Close window" },
] as const;

type WindowControlsProps = { onMinimise: () => void; onMaximise: () => void; onClose: () => void };

export default function WindowControls({ onMinimise, onMaximise, onClose }: WindowControlsProps) {
  const handlers = { minimise: onMinimise, maximise: onMaximise, close: onClose };
  return (
    <>
      {controls.map(({ role, label }) => (
        <button
          key={role}
          type="button"
          className={styles.control}
          data-role={role}
          aria-label={label}
          // Never takes focus, so typing keeps going to the game.
          onMouseDown={(event) => event.preventDefault()}
          onClick={handlers[role]}
        />
      ))}
    </>
  );
}
