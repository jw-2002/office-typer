// What appears on the 3D monitor screen: the desktop, at a fixed pixel size the 3D scene maps onto the glass.
import type { CurrentAssignment } from "@/state/useCurrentAssignment";
import Desktop from "./Desktop";
import styles from "./MonitorScreen.module.css";
import { SCREEN_PX } from "./screenSize";

export default function MonitorScreen({ current }: { current: CurrentAssignment }) {
  return (
    <div className={styles.screen} style={SCREEN_PX}>
      <Desktop current={current} />
    </div>
  );
}
