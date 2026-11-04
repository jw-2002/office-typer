// Which view the camera is in: the intro (zoomed in on the monitor while you give your name), seated at the desk
// (locked in place), or standing up to look around the office.
import { create } from "zustand";

export type CameraView = "intro" | "seated" | "standing";

type ViewStore = {
  view: CameraView;
  /** True when the last change should jump straight to the new view, with no camera move (used when the game loads). */
  instant: boolean;
  setView: (view: CameraView) => void;
  setViewInstantly: (view: CameraView) => void;
};

export const useViewStore = create<ViewStore>()((set) => ({
  view: "seated",
  instant: false,
  setView: (view) => set({ view, instant: false }),
  setViewInstantly: (view) => set({ view, instant: true }),
}));
