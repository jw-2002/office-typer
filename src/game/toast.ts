// The quantum toaster's joke: what it says depending on how many of its two slices came back. Pure, so it can be tested.

/** The chance that each slice comes back up when the lever is let go. The rest of the time it is somewhere else. */
export const TOAST_COMES_BACK = 0.7;

/** The line for how many slices came back, out of two. */
export function toastMessage(slicesUp: number): string {
  if (slicesUp >= 2) return "Both slices are up. Observed, so they had to be.";
  if (slicesUp === 1) return "One slice is up. The other is in a superposition.";
  return "No toast. It is in the box with the cat.";
}
