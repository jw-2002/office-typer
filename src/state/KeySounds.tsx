// All the game's sounds: key presses (in the sound of the switches in use), a fanfare on promotion, a sad tune on
// redundancy, and the office around you (a hum, birds by day, crickets at night, a chair creak). Renders nothing.
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { createKeyClicker } from "@/audio/keyClicker";
import { switchSounds } from "@/audio/switchSounds";
import { GOBLIN_TRACK_ID, trackFor } from "@/audio/tracks";
import { ambienceAt } from "@/game/ambience";
import { upgrades } from "@/game/data/upgrades";
import { equippedUpgrade } from "@/game/progress";
import { timeOfDay } from "@/game/time";
import { useAudioStore } from "./audioStore";
import { useGameStore } from "./gameStore";
import { useSoundCueStore } from "./soundCueStore";
import { useKeyInput } from "./useKeyInput";
import { useViewStore } from "./viewStore";

/**
 * The song that should be playing now: the goblin mode battle theme while goblin mode is on, otherwise the chosen song if
 * it is owned. Nothing when the sound is muted.
 */
function wantedTrack(): string | null {
  const { muted, track } = useAudioStore.getState();
  if (!muted && useGameStore.getState().goblin.active > 0) return GOBLIN_TRACK_ID;
  return !muted && track !== null && useGameStore.getState().upgrades.includes(track) ? track : null;
}

// Printable keys, Backspace and Enter make a sound. Shift, arrows and the like do not.
const makesSound = (key: string) => key.length === 1 || key === "Backspace" || key === "Enter";

export default function KeySounds() {
  const input = useKeyInput();
  const [clicker] = useState(createKeyClicker);
  // Browsers only allow sound after the player has done something, so the office sounds wait for the first key.
  const awake = useRef(false);

  // What the music player is playing, so it is only restarted when the song really changes.
  const playing = useRef<string | null>(null);
  const syncMusic = useEffectEvent(() => {
    const wanted = wantedTrack();
    if (wanted === playing.current) return;
    playing.current = wanted;
    clicker.music(trackFor(wanted));
  });

  const onKey = useEffectEvent((key: string) => {
    if (useAudioStore.getState().muted) return;
    if (!awake.current) {
      awake.current = true;
      clicker.hum(true);
      syncMusic();
    }
    if (!makesSound(key)) return;
    const switches = equippedUpgrade(useGameStore.getState(), "switches");
    // Every switch id has a sound (checked by switchSounds), but the data type only knows them as strings.
    const sound = switchSounds[(switches?.id ?? "mushy") as keyof typeof switchSounds];
    clicker.play(sound);
  });
  useEffect(() => input.subscribe((key) => onKey(key)), [input]);

  // The volume setting goes straight to the player.
  useEffect(() => {
    clicker.setVolume(useAudioStore.getState().volume);
    return useAudioStore.subscribe((state, previous) => {
      if (state.volume !== previous.volume) clicker.setVolume(state.volume);
    });
  }, [clicker]);

  // Sounds asked for by other parts of the app: the desk toys, office events and achievements.
  useEffect(
    () =>
      useSoundCueStore.subscribe((state) => {
        if (state.cue && !useAudioStore.getState().muted) clicker[state.cue.name]();
      }),
    [clicker],
  );

  // A promotion gets a fanfare, once, when the reward that carries it arrives. Being made redundant gets a sad tune.
  useEffect(
    () =>
      useGameStore.subscribe((state, previous) => {
        if (useAudioStore.getState().muted) return;
        if (state.lastReward !== previous.lastReward && state.lastReward?.promotedTo) clicker.fanfare();
        // A clean assignment that extends the streak gets a ping. A promotion has its own fanfare.
        else if (state.lastReward !== previous.lastReward && state.lastReward && state.lastReward.streak >= 2)
          clicker.streak(state.lastReward.streak);
        // Goblin mode starting gets a cackle (the poster click is a gesture, so this works before the first key too).
        if (state.goblin.active > 0 && previous.goblin.active <= 0) clicker.goblin();
        if (state.finale.stage === "redundant" && previous.finale.stage !== "redundant") clicker.redundancy();
      }),
    [clicker],
  );

  // The hum follows the mute setting, and the music follows both the mute and the music setting.
  useEffect(
    () =>
      useAudioStore.subscribe((state) => {
        if (!awake.current) return;
        clicker.hum(!state.muted);
      }),
    [clicker],
  );

  // The music follows the mute setting, the song chosen, and which songs are owned. Choosing a song is a click, so
  // that is allowed to start the sound even before the first key.
  useEffect(() => {
    const stopAudio = useAudioStore.subscribe((state, previous) => {
      if (state.track !== previous.track || awake.current) syncMusic();
    });
    const stopGame = useGameStore.subscribe((state, previous) => {
      // Goblin mode starting or ending swaps the battle theme in or out (starting it is a click, so it may start the sound).
      if (state.goblin.active > 0 !== previous.goblin.active > 0) {
        syncMusic();
        return;
      }
      if (state.upgrades === previous.upgrades) return;
      // A song bought now starts playing, unless one the player owns is already chosen.
      const bought = state.upgrades.find(
        (id) => !previous.upgrades.includes(id) && upgrades.some((u) => u.id === id && u.category === "music"),
      );
      const { track, setTrack } = useAudioStore.getState();
      if (bought && (track === null || !state.upgrades.includes(track))) setTrack(bought);
      else if (awake.current) syncMusic();
    });
    return () => {
      stopAudio();
      stopGame();
    };
  }, []);

  // Every few seconds, maybe a bird or a cricket, depending on the time of day.
  useEffect(() => {
    const id = setInterval(() => {
      if (!awake.current || useAudioStore.getState().muted || document.hidden) return;
      const kind = ambienceAt(timeOfDay(useGameStore.getState().stats.secondsPlayed));
      if (kind === "birds" && Math.random() < 0.08) clicker.birds();
      if (kind === "crickets" && Math.random() < 0.06) clicker.crickets();
    }, 2000);
    return () => clearInterval(id);
  }, [clicker]);

  // Standing up or sitting down makes the chair creak.
  useEffect(
    () =>
      useViewStore.subscribe((state, previous) => {
        if (state.view !== previous.view && awake.current && !useAudioStore.getState().muted) clicker.creak();
      }),
    [clicker],
  );

  return null;
}
