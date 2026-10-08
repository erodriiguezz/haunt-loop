// Every tuning constant lives here. Units: pixels and seconds in the 960x544 logical view.

export const SLUG = "haunt-loop";

export const TILE = 32;
export const COLS = 30;
export const ROWS = 17;
export const VIEW_W = COLS * TILE; // 960
export const VIEW_H = ROWS * TILE; // 544

export const STEP = 1 / 120; // fixed physics step
export const MAX_FRAME = 0.1; // clamp long frames so a stall never teleports anything

export const PHYS = {
  W: 20, // player hitbox
  H: 24,
  RUN: 250,
  ACCEL: 2600,
  FRICTION: 3000,
  AIR_ACCEL: 1800,
  AIR_FRICTION: 700,
  GRAVITY: 2400,
  JUMP: 690, // apex ~99 px: clears a 2-tile ledge, not a 3-tile one
  JUMP_CUT: 0.45, // velocity kept when jump is released early
  MAX_FALL: 820,
  COYOTE: 0.09,
  BUFFER: 0.12,
};

export const RESPAWN_DELAY = 0.3;

// On-screen touch controls, in CSS pixels.
export const TOUCH = {
  GUTTER_MIN: 120, // side columns that hold the buttons, so they never cover play
  GUTTER_FRAC: 0.15,
  GUTTER_MAX: 200,
  TOP_FRAC: 0.3, // the upper part of each gutter holds pause / restart
  SMALL: 56, // pause and restart buttons
};

export const COLORS = {
  bgTop: "#0b1620",
  bgBottom: "#132433",
  wall: "#253244",
  wallDark: "#1a2433",
  wallEdge: "#3a4c63",
  ecto: "#8af0c6", // the green lip on walkable tops
  spike: "#e6edf5",
  spikeDark: "#7d8a99",
  ghost: "#eefcf6",
  ghostShade: "#b9e6d6",
  eye: "#0d1b26",
  danger: "#ff4d6d",
  door: "#f2a65a",
  doorDark: "#5a3a1e",
  text: "#eaf2f8",
  dim: "#7f93a8",
  pass: "#5be38f",
  fail: "#ff5c6c",
};
