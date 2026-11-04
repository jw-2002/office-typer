// A small box shown over the desktop with a dimmed backdrop: the shell shared by "are you sure?" and promotion messages.
import { useEffect, type ReactNode } from "react";
import Window from "./Window";
import styles from "./Dialog.module.css";

type DialogProps = {
  title: string;
  /** Called when the player presses Escape. */
  onClose: () => void;
  /** The id of the element holding the main message, so screen readers read it out. */
  describedBy?: string;
  children: ReactNode;
};

export default function Dialog({ title, onClose, describedBy, children }: DialogProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className={styles.backdrop}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        aria-describedby={describedBy}
        className={styles.dialog}
      >
        <Window title={title}>{children}</Window>
      </div>
    </div>
  );
}

/** The main message of a dialog. */
export function DialogText({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className={styles.text}>
      {children}
    </p>
  );
}

/** The row of buttons at the bottom of a dialog. */
export function DialogActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}
