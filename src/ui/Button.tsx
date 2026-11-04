// The one button style used across the 2D UI. It never takes focus on click, so typing keeps going to the game.
import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** "danger" is a red button for actions that cannot be undone. */
  variant?: "danger";
};

export default function Button({ variant, ...props }: ButtonProps) {
  const className = variant === "danger" ? `${styles.button} ${styles.danger}` : styles.button;
  return <button type="button" className={className} onMouseDown={(event) => event.preventDefault()} {...props} />;
}
