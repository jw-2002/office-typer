// An "are you sure?" box shown over the desktop, for actions that cannot be undone. Escape cancels.
import { useId } from "react";
import Button from "@/ui/shared/Button";
import Dialog, { DialogActions, DialogText } from "./Dialog";

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

  return (
    <Dialog title={title} onClose={onCancel} describedBy={messageId}>
      <DialogText id={messageId}>{message}</DialogText>
      <DialogActions>
        {/* Cancel comes first and is the plain one, so the red button is the deliberate choice. */}
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
