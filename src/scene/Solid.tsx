// Marks things as solid for the mouse: clicks and hovering stop at them, instead of passing through to whatever is
// behind. R3F only knows about objects with event handlers, so without this the monitor, desk and keyboard are
// "see-through" to clicks, and clicking the screen can press a computer on the shelf behind it.
import type { ReactNode } from "react";

const stop = (event: { stopPropagation: () => void }) => event.stopPropagation();

export default function Solid({ children }: { children: ReactNode }) {
  return (
    <group onClick={stop} onPointerOver={stop}>
      {children}
    </group>
  );
}
