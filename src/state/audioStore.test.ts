// Tests for the sound setting store.
import { describe, expect, it } from "vitest";
import { useAudioStore } from "./audioStore";

describe("audio store", () => {
  it("starts with sound on when nothing is stored, and can be muted and unmuted", () => {
    expect(useAudioStore.getState().muted).toBe(false);
    useAudioStore.getState().setMuted(true);
    expect(useAudioStore.getState().muted).toBe(true);
    useAudioStore.getState().setMuted(false);
    expect(useAudioStore.getState().muted).toBe(false);
  });
});
