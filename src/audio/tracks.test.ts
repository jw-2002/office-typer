// Tests that every song's patterns are complete and that every song in the shop has a track.
import { describe, expect, it } from "vitest";
import { upgrades } from "@/game/data/upgrades";
import { STEPS, musicTracks, trackFor } from "./tracks";

describe("music tracks", () => {
  it("has a track for every song in the shop, and none for anything else", () => {
    const songIds = upgrades.filter((upgrade) => upgrade.category === "music").map((upgrade) => upgrade.id);
    expect(Object.keys(musicTracks).sort()).toEqual([...songIds].sort());
  });

  it.each(Object.entries(musicTracks))("%s has patterns of exactly one bar", (_id, track) => {
    expect(track.bass).toHaveLength(STEPS);
    for (const pattern of [track.accents, track.slides, track.kick, track.hat, track.openHat, track.clap]) {
      expect(pattern).toMatch(new RegExp(`^[x.]{${STEPS}}$`));
    }
  });

  it.each(Object.entries(musicTracks))("%s has sensible numbers", (_id, track) => {
    expect(track.bpm).toBeGreaterThan(60);
    expect(track.bpm).toBeLessThan(160);
    expect(track.swing).toBeGreaterThanOrEqual(0);
    expect(track.swing).toBeLessThan(0.5);
    expect(track.filter.base).toBeLessThan(track.filter.peak);
  });

  it("finds a track by id, and gives none for no music or an unknown id", () => {
    expect(trackFor("track-funky")).toBe(musicTracks["track-funky"]);
    expect(trackFor(null)).toBeNull();
    expect(trackFor("plant")).toBeNull();
  });
});
