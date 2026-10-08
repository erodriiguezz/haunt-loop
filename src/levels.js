// Level data. Each map is 30x17 tiles, built with a tiny builder so it stays readable and easy to fork.
//
// Tile legend
//   #  wall          .  empty         S  spawn        E  exit door
//   ^  floor spikes  v  ceiling spikes
//   a-z  a trap group: those tiles belong to the trap in `traps` with the same `tiles` letter
//
// Trap fields shared by every type: `zone: [x0, y0, x1, y1]` (tiles, inclusive) triggers it when
// Nullie's center enters; `delay` seconds; `minDeaths` / `maxDeaths` limit it to certain attempts.
// Trap types live in src/traps.js.
import { COLS, ROWS } from "./config.js";

const GROUND = 12; // top row of the default floor

function build(fn) {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill("."));
  const b = {
    set(x, y, ch) { g[y][x] = ch; return b; },
    rect(x0, y0, x1, y1, ch) {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = ch;
      return b;
    },
    frame() { return b.rect(0, 0, COLS - 1, 0, "#").rect(0, 0, 0, ROWS - 1, "#").rect(COLS - 1, 0, COLS - 1, ROWS - 1, "#"); },
    ground(y = GROUND) { return b.rect(0, y, COLS - 1, ROWS - 1, "#"); },
    pit(x0, x1, y = GROUND) { return b.rect(x0, y, x1, ROWS - 1, "."); },
  };
  b.frame().ground();
  fn(b);
  return g.map((r) => r.join(""));
}

export const LEVELS = [
  {
    name: "Hello, World",
    map: build((b) => {
      b.set(2, 11, "S").set(26, 11, "E");
      b.set(10, 11, "#");
      b.pit(22, 23).rect(22, 12, 23, ROWS - 1, "a"); // full depth, so nothing hints at the pit
    }),
    traps: [{ type: "drop", tiles: "a" }],
    signs: [{ x: 23, y: 9, text: "totally normal floor" }],
  },
  {
    name: "Patience",
    map: build((b) => {
      b.set(2, 11, "S").set(27, 11, "E");
      b.pit(8, 9).pit(15, 16);
      b.rect(18, 11, 19, 11, "b");
      b.set(23, 11, "^");
    }),
    traps: [{ type: "pop", tiles: "b", dir: "up", zone: [13, 8, 14, 11], duration: 1.4 }],
    signs: [{ x: 16, y: 8, text: "mind the gap" }],
  },
  {
    name: "Exit Strategy",
    map: build((b) => {
      b.set(2, 11, "S").set(26, 11, "E");
      b.rect(3, 10, 6, 10, "#");
      b.rect(13, 10, 15, 10, "#");
      b.rect(18, 8, 20, 8, "#");
    }),
    traps: [{ type: "flee", radius: 3.5, to: [[5, 9], [19, 7]] }],
    signs: [{ x: 24, y: 8, text: "almost there!" }],
  },
  {
    name: "Spec Changed",
    map: build((b) => {
      b.set(2, 11, "S").set(26, 11, "E");
      b.pit(9, 10);
      b.rect(19, 1, 21, 2, "c");
    }),
    traps: [{ type: "crush", tiles: "c", zone: [17, 1, 18, 11], delay: 0.15, speed: 1100 }],
    // After the first death the requirements change. Of course they do.
    altAfter: 1,
    alt: build((b) => {
      b.set(2, 11, "S").set(26, 11, "E");
      b.rect(11, 1, 13, 2, "c");
      b.pit(16, 17);
      b.pit(21, 22).rect(21, 12, 22, ROWS - 1, "a");
    }),
    altTraps: [
      { type: "crush", tiles: "c", zone: [9, 1, 10, 11], delay: 0.15, speed: 1100 },
      { type: "drop", tiles: "a" },
    ],
    altSigns: [{ x: 20, y: 6, text: "v2 (final) (final)" }],
  },
  {
    name: "Flaky Test",
    map: build((b) => {
      b.set(2, 11, "S").set(26, 11, "E");
      b.pit(6, 22);
      b.rect(8, 12, 10, 12, "f").rect(13, 12, 15, 12, "g").rect(18, 12, 20, 12, "h");
    }),
    traps: [
      { type: "flaky", tiles: "f", on: 1.6, off: 0.9, phase: 1.2 },
      { type: "flaky", tiles: "g", on: 1.6, off: 0.9, phase: 1.9 },
      { type: "flaky", tiles: "h", on: 1.6, off: 0.9, phase: 2.6 },
    ],
    signs: [{ x: 15, y: 6, text: "passed once. ship it." }],
  },
  {
    name: "Context Window Full",
    map: build((b) => {
      b.set(2, 11, "S").set(27, 11, "E");
      b.set(8, 11, "^");
      b.set(17, 11, "^").rect(21, 11, 22, 11, "^");
    }),
    traps: [
      {
        type: "dialog", zone: [12, 1, 13, 11], rect: [14, 4, 15, 9], duration: 2.6,
        title: "context window full",
        lines: ["summarizing conversation...", "your progress has been", "compacted for efficiency."],
      },
      { type: "teleport", zone: [25, 1, 25, 11], text: "CONTEXT RESET. from the top!" },
    ],
    signs: [{ x: 5, y: 8, text: "read the docs" }],
  },
];
