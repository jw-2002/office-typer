// The context and hook for the sound setting (muted or not).
import { createContext, useContext } from "react";

export type AudioSettings = { muted: boolean; setMuted: (muted: boolean) => void };

export const AudioSettingsContext = createContext<AudioSettings | null>(null);

export function useAudio(): AudioSettings {
  const value = useContext(AudioSettingsContext);
  if (value === null) throw new Error("useAudio must be used inside <AudioProvider>");
  return value;
}
