// Which view the camera is in: seated at the desk (locked in place), or standing up to look around the office.
import { create } from "zustand";

export type CameraView = "seated" | "standing";

type ViewStore = { view: CameraView; setView: (view: CameraView) => void };

export const useViewStore = create<ViewStore>()((set) => ({
  view: "seated",
  setView: (view) => set({ view }),
}));
