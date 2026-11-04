// Data describing the physical keyboard layout (key codes, labels, positions, widths).
export type KeyDef = { code: string; label: string; x: number; z: number; w: number };

type Item = { code: string; label: string; w: number } | number;

const k = (code: string, label: string, w = 1): Item => ({ code, label, w });
const letters = (s: string) => s.split("").map((c) => k(`Key${c}`, c));
const digits = (s: string) => s.split("").map((c) => k(`Digit${c}`, c));
const fkeys = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => k(`F${from + i}`, `F${from + i}`));

// Numbers are horizontal gaps in key units. Tenkeyless ANSI layout.
const rows: Item[][] = [
  [
    k("Escape", "Esc"),
    1,
    ...fkeys(1, 4),
    0.5,
    ...fkeys(5, 8),
    0.5,
    ...fkeys(9, 12),
    0.25,
    k("PrintScreen", "PrtSc"),
    k("ScrollLock", "ScrLk"),
    k("Pause", "Pause"),
  ],
  [
    k("Backquote", "`"),
    ...digits("1234567890"),
    k("Minus", "-"),
    k("Equal", "="),
    k("Backspace", "Bksp", 2),
    0.25,
    k("Insert", "Ins"),
    k("Home", "Home"),
    k("PageUp", "PgUp"),
  ],
  [
    k("Tab", "Tab", 1.5),
    ...letters("QWERTYUIOP"),
    k("BracketLeft", "["),
    k("BracketRight", "]"),
    k("Backslash", "\\", 1.5),
    0.25,
    k("Delete", "Del"),
    k("End", "End"),
    k("PageDown", "PgDn"),
  ],
  [
    k("CapsLock", "Caps", 1.75),
    ...letters("ASDFGHJKL"),
    k("Semicolon", ";"),
    k("Quote", "'"),
    k("Enter", "Enter", 2.25),
  ],
  [
    k("ShiftLeft", "Shift", 2.25),
    ...letters("ZXCVBNM"),
    k("Comma", ","),
    k("Period", "."),
    k("Slash", "/"),
    k("ShiftRight", "Shift", 2.75),
    1.25,
    k("ArrowUp", "↑"),
  ],
  [
    k("ControlLeft", "Ctrl", 1.25),
    k("MetaLeft", "Win", 1.25),
    k("AltLeft", "Alt", 1.25),
    k("Space", "", 6.25),
    k("AltRight", "Alt", 1.25),
    k("MetaRight", "Win", 1.25),
    k("ContextMenu", "Menu", 1.25),
    k("ControlRight", "Ctrl", 1.25),
    0.25,
    k("ArrowLeft", "←"),
    k("ArrowDown", "↓"),
    k("ArrowRight", "→"),
  ],
];

export const keys: KeyDef[] = [];
export let layoutWidth = 0;
export let layoutDepth = 0;

rows.forEach((row, r) => {
  const z = r === 0 ? 0 : r + 0.5; // extra space under the function row
  let x = 0;
  for (const item of row) {
    if (typeof item === "number") {
      x += item;
    } else {
      keys.push({ ...item, x: x + item.w / 2, z });
      x += item.w;
    }
  }
  layoutWidth = Math.max(layoutWidth, x);
  layoutDepth = z + 1;
});
