// Helpers for 3D objects that react to a click: a pointing hand while the pointer is over them, and one call that stops the
// click reaching things behind and plays a sound. Use `hoverHand` on a <group> and call `clicked` from its onClick.
import { useSoundCueStore, type SoundCue } from "@/state/sound/soundCueStore";

export type ClickEvent = { stopPropagation: () => void };

/** Spread onto a <group> or <mesh> to show the pointing hand over it. */
export const hoverHand = {
  onPointerOver: (event: ClickEvent) => {
    event.stopPropagation();
    document.body.style.cursor = "var(--cursor-pointer)";
  },
  onPointerOut: () => {
    document.body.style.cursor = "";
  },
};

/** Call first thing in an onClick: stops the click passing through, and plays the sound if there is one. */
export function clicked(event: ClickEvent, sound?: SoundCue) {
  event.stopPropagation();
  if (sound) useSoundCueStore.getState().play(sound);
}
