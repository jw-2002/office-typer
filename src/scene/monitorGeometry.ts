// Maths for how a tilted monitor sits on whatever is under it.

/**
 * How far to lift a monitor that leans back by `tilt` radians about the middle of its screen, so that it does not sink
 * into the case or desk below. Leaning swings the back-bottom edge of a deep monitor (a CRT) downward; a thin one barely
 * moves. Sizes are in metres.
 */
export function tiltClearance(frameHeight: number, frameDepth: number, tilt: number): number {
  // Lowest point of the frame after the tilt, measured from the middle of the screen, compared with where its bottom
  // edge would be without any tilt.
  const lowest = -(frameHeight / 2) * Math.cos(tilt) - (frameDepth / 2) * Math.sin(tilt);
  const untilted = -frameHeight / 2;
  return Math.max(0, untilted - lowest);
}
