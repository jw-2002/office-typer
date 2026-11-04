// The "you have been promoted" message, shown over the desktop when a finished assignment earns a new job.
import { useEffect, useId } from "react";
import { assignmentTierNames, type Job } from "@/game/data/jobs";
import { previousJob } from "@/game/economy";
import Button from "./Button";
import Dialog, { DialogActions, DialogText } from "./Dialog";
import styles from "./PromotionDialog.module.css";

export default function PromotionDialog({ job, onClose }: { job: Job; onClose: () => void }) {
  const messageId = useId();
  const before = previousJob(job);
  const harder = before !== null && before.assignmentTier !== job.assignmentTier;

  // Enter also dismisses it, because the player is probably still on the keyboard.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <Dialog title="Promotion!" onClose={onClose} describedBy={messageId}>
      <DialogText id={messageId}>Congratulations! You are now a {job.title}.</DialogText>
      <ul className={styles.perks}>
        <li>
          Pay x{job.payoutMultiplier}
          {before && ` (was x${before.payoutMultiplier})`}
        </li>
        {harder && <li>New work: {assignmentTierNames[job.assignmentTier]}</li>}
        <li>A fancier name plate for your desk</li>
      </ul>
      <DialogActions>
        <Button onClick={onClose}>Back to work (Enter)</Button>
      </DialogActions>
    </Dialog>
  );
}
