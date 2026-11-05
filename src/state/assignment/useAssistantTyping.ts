// The text an AI assistant seems to type on its Assistant screen: one text after another, typed out at its own pace.
import { useEffect, useState } from "react";
import { assistantText } from "@/game/text/assistantText";
import type { AssistantSpec } from "@/game/data/upgrades";

/** Slow assistants are shown typing at least this fast, so you actually see what they write. */
const MIN_DISPLAY_CHARS_PER_SECOND = 4;
/** How long a finished text stays on screen before the next one starts. */
const HOLD_MS = 2500;
const REFRESH_MS = 200;

type Run = { text: string; startedAt: number; typingMs: number; charsPerSecond: number };

function startRun(assistant: AssistantSpec, tier: number): Run {
  const charsPerSecond = Math.max(MIN_DISPLAY_CHARS_PER_SECOND, (assistant.wpm * 5) / 60);
  const text = assistantText(assistant, tier, Math.random);
  return { text, startedAt: performance.now(), typingMs: (text.length / charsPerSecond) * 1000, charsPerSecond };
}

/** The text so far, and whether the whole text has been typed. */
export function useAssistantTyping(assistant: AssistantSpec, tier: number): { typed: string; text: string } {
  const [run, setRun] = useState(() => startRun(assistant, tier));
  const [now, setNow] = useState(() => performance.now());

  useEffect(() => {
    const id = setInterval(() => {
      const time = performance.now();
      setNow(time);
      if (time - run.startedAt > run.typingMs + HOLD_MS) setRun(startRun(assistant, tier));
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [assistant, tier, run]);

  const chars = Math.min(run.text.length, Math.max(0, Math.floor(((now - run.startedAt) / 1000) * run.charsPerSecond)));
  return { typed: run.text.slice(0, chars), text: run.text };
}
