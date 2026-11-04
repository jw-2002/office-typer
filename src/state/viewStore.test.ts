// Tests for the camera view store.
import { describe, expect, it } from "vitest";
import { useViewStore } from "./viewStore";

describe("view store", () => {
  it("starts at the desk and can switch to the office and back", () => {
    expect(useViewStore.getState().view).toBe("desk");
    useViewStore.getState().setView("office");
    expect(useViewStore.getState().view).toBe("office");
    useViewStore.getState().setView("desk");
    expect(useViewStore.getState().view).toBe("desk");
  });
});
