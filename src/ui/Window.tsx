// A fake OS window: a title bar (with optional window buttons) over a scrolling body. It follows the OS theme.
import type { ReactNode } from "react";
import styles from "./Window.module.css";

type WindowProps = {
  title: string;
  /** Buttons for the right (or left, depending on the OS) of the title bar. */
  controls?: ReactNode;
  className?: string;
  children: ReactNode;
};

export default function Window({ title, controls, className, children }: WindowProps) {
  return (
    <section
      className={className ? `${styles.window} ${className}` : styles.window}
      aria-label={title}
      data-os-part="window"
    >
      <header className={styles.titlebar} data-os-part="titlebar">
        <h2 className={styles.title}>{title}</h2>
        {controls && <span className={styles.controls}>{controls}</span>}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
