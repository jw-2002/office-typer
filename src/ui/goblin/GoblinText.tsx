// Text that belongs to goblin mode: always dark on bright green, the way the currency is always on yellow.
import type { ReactNode } from "react";
import styles from "./GoblinText.module.css";

export default function GoblinText({ children }: { children: ReactNode }) {
  return <span className={styles.goblin}>{children}</span>;
}
