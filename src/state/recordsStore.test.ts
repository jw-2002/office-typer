// Tests for the fastest-redundancy record.
import { describe, expect, it } from "vitest";
import { useRecordsStore } from "./recordsStore";

describe("records store", () => {
  it("remembers the shortest run and only reports a new record when beaten", () => {
    expect(useRecordsStore.getState().fastestSeconds).toBeNull();
    expect(useRecordsStore.getState().recordRun(3000)).toBe(true);
    expect(useRecordsStore.getState().fastestSeconds).toBe(3000);
    // Slower, and the same run again, are not records.
    expect(useRecordsStore.getState().recordRun(3500)).toBe(false);
    expect(useRecordsStore.getState().recordRun(3000)).toBe(false);
    expect(useRecordsStore.getState().fastestSeconds).toBe(3000);
    expect(useRecordsStore.getState().recordRun(2400)).toBe(true);
    expect(useRecordsStore.getState().fastestSeconds).toBe(2400);
  });
});
