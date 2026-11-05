// Tests that text is readable in every operating system theme: each text colour is measured against the background it
// is drawn on, using the standard contrast ratio (4.5 to 1 is the usual minimum for normal text).
/// <reference types="node" />
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { osNames, type OsId } from "@/game/data/os";

// Every theme file together. There is one file per OS in themes/, named after its id.
const css = Object.keys(osNames)
  .map((id) => readFileSync(new URL(`./themes/${id}.css`, import.meta.url), "utf8"))
  .join("\n");

type Rgba = { r: number; g: number; b: number; a: number };

/** Every `--token: value;` inside one theme block. */
function tokensOf(os: OsId): Map<string, string> {
  const start = css.indexOf(`:root[data-os="${os}"]`);
  const block = css.slice(start, css.indexOf("\n}", start));
  const tokens = new Map<string, string>();
  for (const match of block.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g))
    tokens.set(match[1], match[2].replace(/\s+/g, " ").trim());
  return tokens;
}

/** Every colour written in a value, so a gradient gives all of its stops. */
function coloursIn(value: string): Rgba[] {
  const found: Rgba[] = [];
  for (const match of value.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b|rgba?\(([^)]+)\)/gi)) {
    if (match[1]) {
      const hex = match[1].length === 3 ? [...match[1]].map((c) => c + c).join("") : match[1];
      found.push({
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      });
    } else {
      const [r, g, b, a = "1"] = match[2].split(",").map((part) => part.trim());
      found.push({ r: Number(r), g: Number(g), b: Number(b), a: Number(a) });
    }
  }
  return found;
}

/** Lays a see-through colour over a solid one. */
const over = (top: Rgba, under: Rgba): Rgba => ({
  r: top.r * top.a + under.r * (1 - top.a),
  g: top.g * top.a + under.g * (1 - top.a),
  b: top.b * top.a + under.b * (1 - top.a),
  a: 1,
});

function luminance({ r, g, b }: Rgba): number {
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: Rgba, b: Rgba): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** What shows behind a window: the solid colours of the wallpaper, with see-through ones laid over the first of them. */
function wallpaperColours(tokens: Map<string, string>): Rgba[] {
  const stops = coloursIn(tokens.get("--wallpaper") ?? "");
  const solid = stops.filter((stop) => stop.a === 1);
  const base = solid[solid.length - 1] ?? { r: 0, g: 0, b: 0, a: 1 };
  return [...solid, ...stops.filter((stop) => stop.a < 1).map((stop) => over(stop, base))];
}

/** The worst contrast of a text colour against every colour its background could be (stops and what shows through). */
function worstContrast(tokens: Map<string, string>, textToken: string, backgroundToken: string): number {
  const text = coloursIn(tokens.get(textToken) ?? "")[0];
  const backdrops = wallpaperColours(tokens);
  const ratios: number[] = [];
  for (const background of coloursIn(tokens.get(backgroundToken) ?? "")) {
    for (const backdrop of backdrops) ratios.push(contrast(text, over(background, backdrop)));
  }
  return Math.min(...ratios);
}

// [what the text is, text colour, what it is drawn on]
const pairs: readonly (readonly [string, string, string])[] = [
  ["body text on a panel", "--color-text", "--color-surface"],
  ["body text in a text box", "--color-text", "--color-field"],
  ["grey text on a panel", "--color-muted", "--color-surface"],
  ["the assignment text still to type", "--color-muted", "--color-field"],
  ["accent text on a panel (shop prices)", "--color-accent", "--color-surface"],
  ["typed-correctly text", "--color-correct", "--color-field"],
  ["mistake text", "--color-error", "--color-field"],
  ["warning text on a panel", "--color-error", "--color-surface"],
  ["the current letter highlight", "--color-on-accent", "--color-accent"],
  ["the mistake highlight", "--color-on-accent", "--color-error"],
  ["button text", "--color-text", "--button-bg"],
  ["selected button text", "--button-pressed-text", "--button-pressed-bg"],
  ["window title", "--titlebar-text", "--titlebar-bg"],
  ["task bar text", "--taskbar-text", "--taskbar-bg"],
];

const MINIMUM = 4.5;

describe("theme readability", () => {
  for (const os of Object.keys(osNames) as OsId[]) {
    it(`${os}: every piece of text has enough contrast`, () => {
      const tokens = tokensOf(os);
      const failures = pairs
        .map(([name, text, background]) => ({ name, ratio: worstContrast(tokens, text, background) }))
        .filter(({ ratio }) => ratio < MINIMUM)
        .map(({ name, ratio }) => `${name}: ${ratio.toFixed(2)}`);
      expect(failures).toEqual([]);
    });
  }
});
