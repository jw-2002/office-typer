// An "are you sure?" box shown over the desktop, for actions that cannot be undone. Escape cancels.
import { useEffect, useId } from "react";
import Button from "./Button";
import Window from "./Window";
import styles from "./ConfirmDialog.module.css";

type ConfirmDialogProps = {
  title: string;
  message: string;
  /** Text of the red button that goes ahead with the action. */
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const messageId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div className={styles.backdrop}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        aria-describedby={messageId}
        className={styles.dialog}
      >
        <Window title={title}>
          <p id={messageId} className={styles.message}>
            {message}
          </p>
          <div className={styles.buttons}>
            {/* Cancel comes first and is the plain one, so the red button is the deliberate choice. */}
            <Button onClick={onCancel}>Cancel</Button>
            <Button variant="danger" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </Window>
      </div>
    </div>
  );
}
