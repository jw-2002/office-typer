// Tests that every operating system has a full theme, so switching computers never leaves a token unset.
/// <reference types="node" />
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { osNames, type OsId } from "@/game/data/os";
// Read as text: vitest does not give back the contents of CSS files that are imported.
const themes = readFileSync(new URL("./osThemes.css", import.meta.url), "utf8");

/** The custom properties set inside one theme block. */
function tokensOf(os: OsId): Set<string> {
  const start = themes.indexOf(`:root[data-os="${os}"]`);
  if (start === -1) return new Set();
  const block = themes.slice(start, themes.indexOf("}", start));
  return new Set([...block.matchAll(/(--[a-z0-9-]+):/g)].map((match) => match[1]));
}

const osIds = Object.keys(osNames) as OsId[];

describe("operating system themes", () => {
  it("has a block for every OS", () => {
    for (const os of osIds) expect(tokensOf(os).size, os).toBeGreaterThan(0);
  });

  it("sets the same tokens in every theme", () => {
    const expected = tokensOf("classic");
    expect(expected.size).toBeGreaterThan(20);
    for (const os of osIds) expect([...tokensOf(os)].sort(), os).toEqual([...expected].sort());
  });
});
