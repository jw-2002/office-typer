// What appears on the 3D monitor's screen: a fixed-size DOM page holding the assignment panel.
import type { CurrentAssignment } from "@/state/useCurrentAssignment";
import AssignmentPanel from "./AssignmentPanel";
import styles from "./MonitorScreen.module.css";
import { SCREEN_PX } from "./screenSize";

export default function MonitorScreen({ current }: { current: CurrentAssignment }) {
  return (
    <div className={styles.screen} style={SCREEN_PX}>
      <AssignmentPanel current={current} />
    </div>
  );
}
