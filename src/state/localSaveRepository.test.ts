// Tests for the localStorage save repository, using a fake storage.
import { describe, expect, it } from "vitest";
import { newProgress } from "@/game/progress";
import { toSave } from "@/game/save";
import { SAVE_KEY, createLocalSaveRepository, type StorageLike } from "./localSaveRepository";

function fakeStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

describe("local save repository", () => {
  it("loads null when nothing is saved", async () => {
    expect(await createLocalSaveRepository(fakeStorage()).load()).toBeNull();
  });

  it("saves and loads", async () => {
    const repository = createLocalSaveRepository(fakeStorage());
    const save = toSave({ ...newProgress(), player: { name: "", currency: 77 } }, 5);
    await repository.save(save);
    expect(await repository.load()).toEqual(save);
  });

  it("keeps a backup and returns null for a damaged save", async () => {
    const storage = fakeStorage({ [SAVE_KEY]: "{not json" });
    expect(await createLocalSaveRepository(storage).load()).toBeNull();
    expect(storage.data[`${SAVE_KEY}.backup`]).toBe("{not json");
  });

  it("does not crash when storage throws", async () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("full");
      },
    };
    const repository = createLocalSaveRepository(broken);
    expect(await repository.load()).toBeNull();
    await expect(repository.save(toSave(newProgress(), 0))).resolves.toBeUndefined();
  });
});
