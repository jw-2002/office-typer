// Pointer handling for the <Canvas>: the same as R3F's default, except the mouse position is measured against the
// canvas itself. By default R3F uses event.offsetX/Y, which is relative to whatever element was clicked. The monitor
// screen is real DOM inside the canvas container, so a click on its text reported a tiny offset from that text, which
// R3F read as a click near the top-left of the 3D view (where the shelf is) and swapped computers.
import { events, type EventManager, type RootStore } from "@react-three/fiber";

type Rect = { left: number; top: number; width: number; height: number };

/** A mouse position as R3F wants it: x and y each from -1 to 1 across the canvas, with y up. */
export function toNormalisedPointer(clientX: number, clientY: number, rect: Rect): { x: number; y: number } {
  return {
    x: ((clientX - rect.left) / rect.width) * 2 - 1,
    y: -((clientY - rect.top) / rect.height) * 2 + 1,
  };
}

export function createCanvasEvents(store: RootStore): EventManager<HTMLElement> {
  return {
    ...events(store),
    compute(event, state) {
      const { x, y } = toNormalisedPointer(event.clientX, event.clientY, state.gl.domElement.getBoundingClientRect());
      state.pointer.set(x, y);
      state.raycaster.setFromCamera(state.pointer, state.camera);
    },
  };
}
