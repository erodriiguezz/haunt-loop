// Recorded solutions, one or more per level. Each step is [seconds, keys]: R right, L left, J jump held.
// `deaths` replays the attempt number (spec-change levels have a different map after a death).
// `expect: "death"` marks a naive run that must get trolled, proving the trap actually bites.
const naive = (inputs) => ({ deaths: 0, expect: "death", inputs });
export const REPLAYS = {
  1: [naive([[0.75, "R"], [0.3, "RJ"], [3, "R"]]), { deaths: 0, inputs: [[0.75, "R"], [0.3, "RJ"], [1.3, "R"], [0.35, "RJ"], [1.5, "R"]] }],
  2: [naive([[0.6, "R"], [0.3, "RJ"], [0.6, "R"], [0.3, "RJ"], [2, "R"]]), { deaths: 0, inputs: [[0.6, "R"], [0.3, "RJ"], [0.55, "R"], [1.7, ""], [0.15, "R"], [0.3, "RJ"], [0.6, "R"], [0.3, "RJ"], [1, "R"]] }],
  3: [{ deaths: 0, inputs: [[2.7, "R"], [2.3, "L"], [0.55, "R"], [0.35, "RJ"], [0.4, "R"], [0.35, "RJ"], [0.6, "R"]] }],
  4: [
    naive([[0.7, "R"], [0.3, "RJ"], [3, "R"]]),
    { deaths: 0, inputs: [[0.7, "R"], [0.3, "RJ"], [0.88, "R"], [0.8, ""], [0.05, "R"], [0.35, "RJ"], [1.3, "R"]] },
    { deaths: 1, inputs: [[0.95, "R"], [0.8, ""], [0.05, "R"], [0.35, "RJ"], [0.43, "R"], [0.35, "RJ"], [0.3, "R"], [0.35, "RJ"], [1, "R"]] },
  ],
  5: [naive([[0.42, "R"], [0.3, "RJ"], [2, "R"]]), { deaths: 0, inputs: [[0.7, ""], [0.42, "R"], [0.3, "RJ"], [0.3, "R"], [0.3, "RJ"], [0.3, "R"], [0.3, "RJ"], [0.3, "R"], [0.3, "RJ"], [1, "R"]] }],
  6: [{ deaths: 0, inputs: [[0.55, "R"], [0.3, "RJ"], [0.5, "R"], [2.6, ""], [0.25, "R"], [0.3, "RJ"], [0.3, "R"], [0.3, "RJ"], [0.9, "R"], [0.3, "RJ"], [0.85, "R"], [0.3, "RJ"], [0.3, "R"], [0.3, "RJ"], [1.2, "R"]] }],
};
