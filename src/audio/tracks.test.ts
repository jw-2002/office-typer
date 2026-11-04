// Tests that every song's patterns are complete and that every song in the shop has a track.
import { describe, expect, it } from "vitest";
import { upgrades } from "@/game/data/upgrades";
import { DEFAULT_TRACK } from "@/state/audioStore";
import { GOBLIN_TRACK_ID, STEPS, musicTracks, trackFor, type TrackSpec } from "./tracks";

const songs: [string, TrackSpec][] = Object.entries(musicTracks);
const everyTrack: [string, TrackSpec][] = [...songs, [GOBLIN_TRACK_ID, trackFor(GOBLIN_TRACK_ID)!]];

describe("music tracks", () => {
  it("has a track for every song in the shop, and none for anything else", () => {
    const songIds = upgrades.filter((upgrade) => upgrade.category === "music").map((upgrade) => upgrade.id);
    expect(Object.keys(musicTracks).sort()).toEqual([...songIds].sort());
  });

  it.each(everyTrack)("%s has patterns that are whole bars and all the same length", (_id, track) => {
    const length = track.bass.length;
    expect(length % STEPS).toBe(0);
    for (const pattern of [track.accents, track.slides, track.kick, track.hat, track.openHat, track.clap]) {
      expect(pattern).toMatch(new RegExp(`^[x.]{${length}}$`));
    }
    if (track.lead) {
      expect(track.lead.notes).toHaveLength(length);
      expect(track.lead.slides).toMatch(new RegExp(`^[x.]{${length}}$`));
    }
  });

  it.each(everyTrack)("%s has sensible numbers", (_id, track) => {
    expect(track.bpm).toBeGreaterThan(60);
    expect(track.bpm).toBeLessThan(200);
    expect(track.swing).toBeGreaterThanOrEqual(0);
    expect(track.swing).toBeLessThan(0.5);
    expect(track.filter.base).toBeLessThan(track.filter.peak);
  });

  it("has a battle theme for goblin mode that is not for sale and has a lead tune", () => {
    const goblin = trackFor(GOBLIN_TRACK_ID);
    expect(goblin?.lead).toBeDefined();
    expect(Object.keys(musicTracks)).not.toContain(GOBLIN_TRACK_ID);
    expect(goblin!.bpm).toBeGreaterThan(150);
  });

  it("has a free song that plays from the start", () => {
    const free = upgrades.find((upgrade) => upgrade.id === DEFAULT_TRACK);
    expect(free?.category).toBe("music");
    expect(free?.cost).toBe(0);
    expect(trackFor(DEFAULT_TRACK)).not.toBeNull();
  });

  it("finds a track by id, and gives none for no music or an unknown id", () => {
    expect(trackFor("track-funky")).toBe(musicTracks["track-funky"]);
    expect(trackFor(null)).toBeNull();
    expect(trackFor("plant")).toBeNull();
  });
});
