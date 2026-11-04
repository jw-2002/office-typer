// Tests that the name plates get bigger and grander with every promotion.
import { describe, expect, it } from "vitest";
import { jobs } from "@/game/data/jobs";
import { nameplateLook, nameplateLooks } from "./nameplateLooks";

describe("name plates", () => {
  it("has a plate for every job, each wider than the one before", () => {
    const widths = jobs.map((job) => nameplateLooks[job.id].width);
    for (let i = 1; i < widths.length; i++) expect(widths[i]).toBeGreaterThan(widths[i - 1]);
  });

  it("falls back to the first plate for an unknown job", () => {
    expect(nameplateLook("nope")).toBe(nameplateLooks.intern);
  });
});
