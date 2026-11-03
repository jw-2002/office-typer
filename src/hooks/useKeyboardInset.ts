import { useEffect } from "react";

/**
 * Publishes the height of the on-screen keyboard as the CSS variable --keyboard-inset, so fixed
 * elements can sit above it. iOS Safari lets the keyboard cover the page, so the visual viewport shrinks
 * while the layout viewport does not. Browsers that resize the layout instead report an inset of 0.
 */
export function useKeyboardInset(): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.documentElement.style.setProperty("--keyboard-inset", `${inset}px`);
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      document.documentElement.style.removeProperty("--keyboard-inset");
    };
  }, []);
}
