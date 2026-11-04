// The ending. The top AI assistant can do your job, so you are made redundant. Shows how the run went and offers a new one.
import { useEffect, useId } from "react";
import { upgrades, type Upgrade } from "@/game/data/upgrades";
import { formatDuration, formatNumber } from "@/game/economy";
import { currentJob } from "@/game/progress";
import { useGameStore } from "@/state/gameStore";
import { useRecordsStore } from "@/state/recordsStore";
import Button from "./Button";
import Money from "./Money";
import Dialog, { DialogActions, DialogText } from "./Dialog";
import styles from "./RedundancyDialog.module.css";

// The assistant that takes your job. `upgrades` is typed per item, so view it as plain upgrades to look at `endsGame`.
const catalogue: readonly Upgrade[] = upgrades;
const replacement = catalogue.find((upgrade) => upgrade.endsGame);

/** A gift that depends on how much you typed, because every farewell needs a cardboard box. */
function leavingGift(totalChars: number): string {
  if (totalChars > 6000) return "A cardboard box and a framed keyboard";
  if (totalChars > 3000) return "A cardboard box and a mug";
  return "A cardboard box";
}

export default function RedundancyDialog() {
  const messageId = useId();
  const stats = useGameStore((state) => state.stats);
  const name = useGameStore((state) => state.player.name);
  const job = useGameStore(currentJob);
  const reset = useGameStore((state) => state.reset);
  const fastest = useRecordsStore((state) => state.fastestSeconds);
  const recordRun = useRecordsStore((state) => state.recordRun);

  // Remember this run if it was the fastest. Safe to run twice: a run never beats itself.
  useEffect(() => {
    recordRun(stats.secondsPlayed);
  }, [recordRun, stats.secondsPlayed]);
  const newRecord = fastest !== null && Math.abs(fastest - stats.secondsPlayed) < 0.5;

  return (
    // No Escape to close it: the only way on is to start again.
    <Dialog title="Redundancy notice" describedBy={messageId}>
      <DialogText id={messageId}>
        Dear {name || "colleague"}, thank you for your service as {job.title}.{" "}
        {replacement?.name ?? "The new assistant"} can do everything you do, faster, and without lunch breaks. Your desk
        will be needed by Monday.
      </DialogText>
      <dl className={styles.stats}>
        <dt>Time at the company</dt>
        <dd>{formatDuration(stats.secondsPlayed)}</dd>
        <dt>Assignments finished</dt>
        <dd>{formatNumber(stats.assignmentsCompleted)}</dd>
        <dt>Characters typed</dt>
        <dd>{formatNumber(stats.totalChars)}</dd>
        <dt>Highest WPM</dt>
        <dd>{Math.round(stats.bestWpm)}</dd>
        <dt>Earned in total</dt>
        <dd>
          <Money amount={stats.totalEarned} />
        </dd>
        <dt>Leaving gift</dt>
        <dd>{leavingGift(stats.totalChars)}</dd>
        <dt>Fastest redundancy</dt>
        <dd>
          {fastest === null ? "-" : formatDuration(fastest)}
          {newRecord && " (new record!)"}
        </dd>
      </dl>
      <DialogActions>
        <Button onClick={reset}>Start a new career</Button>
      </DialogActions>
    </Dialog>
  );
}
