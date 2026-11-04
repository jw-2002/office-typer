// A fake computer desktop: a window with a title bar and a task bar of tabs (Assignment, Shop). It takes the
// look of the operating system the computer runs. Shown on the 3D monitor, or in the HUD on touch devices.
import { useState, type ReactNode } from "react";
import { osNames } from "@/game/data/os";
import { useOs } from "@/hooks/useOsTheme";
import type { CurrentAssignment } from "@/state/useCurrentAssignment";
import AssignmentPanel from "./AssignmentPanel";
import Button from "./Button";
import ShopPanel from "./ShopPanel";
import styles from "./Desktop.module.css";

const tabs = [
  { id: "assignment", label: "Assignment" },
  { id: "shop", label: "Shop" },
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
  const os = useOs();
  const title = tab === "assignment" ? current.assignment.title : "Shop";

  return (
    <div className={styles.desktop}>
      <section className={styles.window} aria-label={title}>
        <header className={styles.titlebar}>
          <h1 className={styles.title}>{title}</h1>
          {/* Decorative only. The three buttons change shape and colour with the OS. */}
          <span className={styles.controls} aria-hidden="true">
            <span className={styles.control} />
            <span className={styles.control} />
            <span className={styles.control} />
          </span>
        </header>
        <div className={styles.body}>
          {/* A new key per tab remounts the page, which restarts the OS animation. */}
          <div key={tab} className={styles.page}>
            {tab === "assignment" ? <AssignmentPanel current={current}>{typingField}</AssignmentPanel> : <ShopPanel />}
          </div>
        </div>
      </section>

      <nav className={styles.taskbar} aria-label="Programs">
        {tabs.map(({ id, label }) => (
          <Button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>
            {label}
          </Button>
        ))}
        <span className={styles.os}>{osNames[os]}</span>
      </nav>
    </div>
  );
}
