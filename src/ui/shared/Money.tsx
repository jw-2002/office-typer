// An amount of the game currency, always shown the same way: the symbol and the number, highlighted in yellow.
import { CURRENCY } from "@/game/economy/currency";
import { formatNumber } from "@/game/economy/economy";
import styles from "./Money.module.css";

type MoneyProps = {
  amount: number;
  /** Shown instead of the number, such as a rate ("2.5/s"). The symbol is still added. */
  text?: string;
};

export default function Money({ amount, text }: MoneyProps) {
  return (
    <span className={styles.money} title={CURRENCY.name}>
      {CURRENCY.symbol}
      {text ?? formatNumber(amount)}
    </span>
  );
}
