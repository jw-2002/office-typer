// The settings program: your record, sound and display settings, and the reset (which asks for confirmation first).
import { useState } from "react";
import { CURRENCY } from "@/game/economy/currency";
import { upgrades } from "@/game/data/upgrades";
import { formatDuration, formatNumber } from "@/game/economy/economy";
import { useAudioStore } from "@/state/sound/audioStore";
import { useDisplayStore } from "@/state/view/displayStore";
import { decodeSave, encodeSave } from "@/game/progress/saveCode";
import { progressOf, useGameStore } from "@/state/game/gameStore";
import Button from "@/ui/shared/Button";
import GoblinHint from "@/ui/goblin/GoblinHint";
import GoblinText from "@/ui/goblin/GoblinText";
import Money from "@/ui/shared/Money";
import styles from "./SettingsPanel.module.css";

type SettingsPanelProps = {
  /** Asks the desktop to show the "are you sure?" box. The reset itself happens after the player confirms. */
  onRequestReset: () => void;
};

export default function SettingsPanel({ onRequestReset }: SettingsPanelProps) {
  const stats = useGameStore((state) => state.stats);
  const owned = useGameStore((state) => state.upgrades);
  const muted = useAudioStore((state) => state.muted);
  const setMuted = useAudioStore((state) => state.setMuted);
  const track = useAudioStore((state) => state.track);
  const setTrack = useAudioStore((state) => state.setTrack);
  const volume = useAudioStore((state) => state.volume);
  const setVolume = useAudioStore((state) => state.setVolume);
  const display = useDisplayStore();
  const load = useGameStore((state) => state.load);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const copySave = async () => {
    const text = encodeSave(progressOf(useGameStore.getState()), Date.now());
    setCode(text);
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied. Keep it somewhere safe.");
    } catch {
      setMessage("Select the code in the box and copy it yourself.");
    }
  };
  const loadSave = () => {
    const save = decodeSave(code);
    if (!save) return setMessage("That is not a valid save code.");
    load(save);
    setCode("");
    setMessage("Save loaded.");
  };

  // Songs are bought in the shop. Only the ones owned can be chosen here.
  const songs = upgrades.filter((upgrade) => upgrade.category === "music" && owned.includes(upgrade.id));
  const playing = track !== null && songs.some((song) => song.id === track) ? track : null;

  return (
    <div className={styles.settings}>
      <div className={styles.column}>
        <section>
          <h3 className={styles.heading}>Your record</h3>
          <dl className={styles.stats}>
            <dt>Time played</dt>
            <dd>{formatDuration(stats.secondsPlayed)}</dd>
            <dt>Assignments finished</dt>
            <dd>{formatNumber(stats.assignmentsCompleted)}</dd>
            <dt>Characters typed</dt>
            <dd>{formatNumber(stats.totalChars)}</dd>
            <dt>Highest WPM</dt>
            <dd>{Math.round(stats.bestWpm)}</dd>
            <dt>Earned in total</dt>
            <dd>
              <Money amount={stats.totalEarned} />
            </dd>
            <dt>Goblin mode used</dt>
            <dd>
              <GoblinText>{stats.goblinUses} times</GoblinText>
            </dd>
          </dl>
          <GoblinHint className={styles.hint} />
        </section>

        <section>
          <h3 className={styles.heading}>Back up your save</h3>
          <p className={styles.text}>
            Copy your game as a line of text to keep or move to another browser. Loading one replaces this game.
          </p>
          <textarea
            className={styles.code}
            rows={3}
            value={code}
            placeholder="Paste a save code here"
            aria-label="Save code"
            onChange={(event) => setCode(event.target.value)}
          />
          <div className={styles.buttons}>
            <Button onClick={copySave}>Copy save</Button>
            <Button onClick={loadSave} disabled={code.trim() === ""}>
              Load save
            </Button>
          </div>
          <p className={styles.text} role="status">
            {message}
          </p>
        </section>
      </div>

      <div className={styles.column}>
        <section>
          <h3 className={styles.heading}>Sound</h3>
          <div className={styles.buttons}>
            <Button aria-pressed={!muted} onClick={() => setMuted(!muted)}>
              {muted ? "Sound: off" : "Sound: on"}
            </Button>
          </div>
          <label className={styles.slider}>
            Volume
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
            />
          </label>
        </section>

        <section>
          <h3 className={styles.heading}>Music</h3>
          {songs.length === 0 ? (
            <p className={styles.text}>No music yet. Songs are sold in the shop.</p>
          ) : (
            <div className={styles.buttons}>
              <Button aria-pressed={playing === null} onClick={() => setTrack(null)}>
                Off
              </Button>
              {songs.map((song) => (
                <Button key={song.id} aria-pressed={playing === song.id} onClick={() => setTrack(song.id)}>
                  {song.name}
                </Button>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className={styles.heading}>Display</h3>
          <div className={styles.buttons}>
            <Button
              aria-pressed={display.reducedMotion}
              title="No camera glide, drifting dust, steam or animated screen changes"
              onClick={() => display.set({ reducedMotion: !display.reducedMotion })}
            >
              Reduced motion: {display.reducedMotion ? "on" : "off"}
            </Button>
            <Button aria-pressed={display.largeText} onClick={() => display.set({ largeText: !display.largeText })}>
              Larger text: {display.largeText ? "on" : "off"}
            </Button>
            <Button
              aria-pressed={display.quality === "low"}
              title="Turns down shadows, glow and sharpness for a slower computer"
              onClick={() => display.set({ quality: display.quality === "low" ? "high" : "low" })}
            >
              Graphics: {display.quality === "low" ? "low" : "high"}
            </Button>
          </div>
        </section>

        <section>
          <h3 className={styles.heading}>Start again</h3>
          <p className={styles.text}>
            Erases your {CURRENCY.name}, upgrades, promotions and record, and starts over as an Intern. Your game is
            saved in this browser automatically, so this is the only way to wipe it.
          </p>
          <Button onClick={onRequestReset}>Reset game...</Button>
        </section>
      </div>
    </div>
  );
}
