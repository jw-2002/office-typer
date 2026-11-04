// Tests for the camera view store.
import { describe, expect, it } from "vitest";
import { useViewStore } from "./viewStore";

describe("view store", () => {
  it("starts seated and can stand up and sit down again", () => {
    expect(useViewStore.getState().view).toBe("seated");
    useViewStore.getState().setView("standing");
    expect(useViewStore.getState().view).toBe("standing");
    useViewStore.getState().setView("seated");
    expect(useViewStore.getState().view).toBe("seated");
  });
});
