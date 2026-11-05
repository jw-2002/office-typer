// A fake computer desktop: a window with working title bar buttons, and a task bar of programs (Assignment, Shop,
// Career, Assistant, Settings), with a status tray. It takes the look of the operating system the computer runs. Shown on the 3D monitor, or in the HUD on touch.
import { useState, type ReactNode } from "react";
import { osNames } from "@/game/data/os";
import { useOs } from "@/hooks/useOsTheme";
import { useEventStore } from "@/state/game/eventStore";
import { useGameStore } from "@/state/game/gameStore";
import type { CurrentAssignment } from "@/state/assignment/useCurrentAssignment";
import AchievementToast from "@/ui/dialogs/AchievementToast";
import AssignmentPanel from "@/ui/programs/AssignmentPanel";
import AssistantPanel from "@/ui/programs/AssistantPanel";
import Button from "@/ui/shared/Button";
import CareerPanel from "@/ui/programs/CareerPanel";
import ConfirmDialog from "@/ui/dialogs/ConfirmDialog";
import EventDialog from "@/ui/dialogs/EventDialog";
import NameDialog from "@/ui/dialogs/NameDialog";
import PromotionDialog from "@/ui/dialogs/PromotionDialog";
import RedundancyDialog from "@/ui/dialogs/RedundancyDialog";
import SettingsPanel from "@/ui/programs/SettingsPanel";
import ShopPanel from "@/ui/programs/ShopPanel";
import Tray from "./Tray";
import Window from "./Window";
import WindowControls from "./WindowControls";
import TabIcon from "./TabIcon";
import styles from "./Desktop.module.css";

const tabs = [
  { id: "assignment", label: "Assignment" },
  { id: "shop", label: "Shop" },
  { id: "career", label: "Career" },
  { id: "assistant", label: "Assistant" },
  { id: "settings", label: "Settings" },
] as const;
type TabId = (typeof tabs)[number]["id"];

// Props only, no context: this renders inside the monitor's separate React root.
type DesktopProps = {
  current: CurrentAssignment;
  /** Extra content for the assignment tab, such as the touch typing field. */
  typingField?: ReactNode;
};

export default function Desktop({ current, typingField }: DesktopProps) {
  const [tab, setTab] = useState<TabId>("assignment");
  // The window can be hidden (minimised or closed) and brought back from the task bar, or made to fill the screen.
  const [open, setOpen] = useState(true);
  const [maximised, setMaximised] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const reset = useGameStore((state) => state.reset);
  const promotion = useGameStore((state) => state.lastReward?.promotedTo ?? null);
  const dismissPromotion = useGameStore((state) => state.dismissPromotion);
  const redundant = useGameStore((state) => state.finale.stage === "redundant");
  const eventOpen = useEventStore((state) => state.current !== null);
  const introduced = useGameStore((state) => state.player.name !== "");
  const os = useOs();

  const title = tab === "assignment" ? current.assignment.title : tabs.find((t) => t.id === tab)?.label;
  // Closing a program goes back to the assignment. Closing the assignment itself leaves just the desktop.
  const close = () => (tab === "assignment" ? setOpen(false) : setTab("assignment"));

  const confirmReset = () => {
    reset();
    setConfirmingReset(false);
    setTab("assignment");
  };

  return (
    <div className={styles.desktop} data-maximised={maximised} data-os-part="desktop">
      {open ? (
        <Window
          title={title ?? ""}
          className={styles.window}
          controls={
            <WindowControls
              onMinimise={() => setOpen(false)}
              onMaximise={() => setMaximised((value) => !value)}
              onClose={close}
            />
          }
        >
          {/* A new key per tab remounts the page, which restarts the OS animation. */}
          <div key={tab} className={styles.page}>
            {tab === "assignment" && <AssignmentPanel current={current}>{typingField}</AssignmentPanel>}
            {tab === "shop" && <ShopPanel />}
            {tab === "career" && <CareerPanel />}
            {tab === "assistant" && <AssistantPanel onOpenShop={() => setTab("shop")} />}
            {tab === "settings" && <SettingsPanel onRequestReset={() => setConfirmingReset(true)} />}
          </div>
        </Window>
      ) : (
        <p className={styles.hint}>Nothing is open. Pick a program from the task bar.</p>
      )}

      <nav className={styles.taskbar} aria-label="Programs" data-os-part="taskbar">
        {tabs.map(({ id, label }) => (
          <Button
            key={id}
            aria-pressed={open && tab === id}
            // The button shows only a picture, so the name is given here for screen readers and as a hover tip.
            aria-label={label}
            title={label}
            onClick={() => {
              setTab(id);
              setOpen(true);
            }}
          >
            <TabIcon name={id} />
          </Button>
        ))}
        <Tray current={current} />
        <span className={styles.os}>{osNames[os]}</span>
      </nav>

      {promotion && !redundant && <PromotionDialog job={promotion} onClose={dismissPromotion} />}

      {redundant && <RedundancyDialog />}

      {eventOpen && !redundant && introduced && <EventDialog />}

      {/* The full-screen redundancy notice has no room for pop-ups. */}
      {!redundant && <AchievementToast />}

      {!introduced && <NameDialog />}

      {confirmingReset && (
        <ConfirmDialog
          title="Reset game?"
          message="This erases all of your progress and cannot be undone. Are you sure?"
          confirmLabel="Yes, erase everything"
          onConfirm={confirmReset}
          onCancel={() => setConfirmingReset(false)}
        />
      )}
    </div>
  );
}
