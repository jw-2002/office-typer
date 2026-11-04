// Which finger of which hand presses which key, the way you are taught to touch type. Used to animate the helping hands.
// Positions are in keyboard units (see layout.ts): the home row starts at x = 2.25 (A) and J is at 8.25.

export type HandSide = "left" | "right";

export type FingerAssignment = {
  hand: HandSide;
  /** 0 to 3, counted from the left edge of the hand: the left hand is pinky, ring, middle, index; the right hand is the reverse. */
  finger: number;
  /** True for the space bar, which is pressed with a thumb. */
  thumb: boolean;
};

/** Keys left of this belong to the left hand: B is the last left-hand key and Y the first right-hand one. */
export const SPLIT_X = 6.9;

// Where one finger's keys end and the next begin, going left to right across each hand.
const LEFT_EDGES = [2.8, 3.8, 4.8] as const;
const RIGHT_EDGES = [9.0, 10.0, 11.0] as const;

const fingerIndex = (x: number, edges: readonly number[]) => edges.filter((edge) => x >= edge).length;

export function fingerFor(code: string, x: number): FingerAssignment {
  if (code === "Space") return { hand: "right", finger: 0, thumb: true };
  if (x < SPLIT_X) return { hand: "left", finger: fingerIndex(x, LEFT_EDGES), thumb: false };
  return { hand: "right", finger: fingerIndex(x, RIGHT_EDGES), thumb: false };
}
