// Saves to the browser's localStorage. A damaged save is copied to a backup key before it is ignored.
import { migrate, type SaveData, type SaveRepository } from "@/game/progress/save";

export const SAVE_KEY = "office-typer.save";
const BACKUP_KEY = `${SAVE_KEY}.backup`;

/** Just the parts of localStorage we use, so tests can pass a fake. */
export type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function createLocalSaveRepository(storage: StorageLike = window.localStorage): SaveRepository {
  return {
    async load() {
      let text: string | null;
      try {
        text = storage.getItem(SAVE_KEY);
      } catch {
        return null; // Storage blocked (private mode, policy). Play without saving.
      }
      if (text === null) return null;

      let parsed: unknown = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        // Not JSON at all. Handled with the other unusable cases below.
      }
      const save = migrate(parsed);
      if (save === null) {
        try {
          storage.setItem(BACKUP_KEY, text);
        } catch {
          // Nothing more we can do.
        }
      }
      return save;
    },

    async save(data: SaveData) {
      try {
        storage.setItem(SAVE_KEY, JSON.stringify(data));
      } catch {
        // Storage full or blocked. Losing one autosave is better than crashing the game.
      }
    },
  };
}
