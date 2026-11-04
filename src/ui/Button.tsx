// The one button style used across the 2D UI. It never takes focus on click, so typing keeps going to the game.
import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={styles.button} onMouseDown={(event) => event.preventDefault()} {...props} />;
}
