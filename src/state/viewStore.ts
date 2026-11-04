// Which view the camera is in: close to the screen at the desk, or pulled back to look around the office.
import { create } from "zustand";

export type CameraView = "desk" | "office";

type ViewStore = { view: CameraView; setView: (view: CameraView) => void };

export const useViewStore = create<ViewStore>()((set) => ({
  view: "desk",
  setView: (view) => set({ view }),
}));
