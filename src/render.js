// Everything drawn in the 960x544 logical view: level, traps, Nullie, particles, overlays.
// All art is procedural, chunky 4px "pixels" on canvas.
import { TILE, COLS, ROWS, VIEW_W, VIEW_H, COLORS as C } from "./config.js";

export const FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

// ---------- Nullie ----------
// 7x7 sprite at 4px. 'o' body, 's' shade. Eyes and hem are drawn separately.
const BODY = ["..ooo..", ".ooooo.", "ooooooo", "ooooooo", "ooooooo", "oooooos"];
const HEMS = ["o.oo.os", ".oo.oo."];

export function drawGhost(ctx, x, y, { face = 1, t = 0, flip = false, angry = false, scale = 1 } = {}) {
  const px = 4 * scale;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (flip) { ctx.translate(0, 7 * px); ctx.scale(1, -1); }
  const rows = [...BODY, HEMS[Math.floor(t * 6) % 2]];
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < 7; c++) {
      const ch = rows[r][c];
      if (ch === ".") continue;
      ctx.fillStyle = ch === "s" || (r === 5 && c > 4) ? C.ghostShade : C.ghost;
      ctx.fillRect(c * px, r * px, px, px);
    }
  }
  const blink = (t % 3.2) < 0.12;
  const ex = face > 0 ? 3 : face < 0 ? 1 : 2;
  ctx.fillStyle = angry ? C.danger : C.eye;
  ctx.fillRect(ex * px, (blink ? 3 : 2) * px, px, (blink ? 1 : 2) * px);
  ctx.fillRect((ex + 2) * px, (blink ? 3 : 2) * px, px, (blink ? 1 : 2) * px);
  if (angry) { // brows
    ctx.fillRect((ex - 1) * px, 1 * px, px, px / 2);
    ctx.fillRect((ex + 3) * px, 1 * px, px, px / 2);
  }
  ctx.restore();
}

// ---------- tiles ----------
const isWallish = (grid, groups, tx, ty) => {
  if (tx < 0 || tx >= COLS) return true;
  if (ty < 0 || ty >= ROWS) return false;
  const c = grid[ty][tx];
  return c === "#" || (groups[c] && groups[c].look === "wall");
};

function hash(x, y) { return ((x * 73856093) ^ (y * 19349663)) >>> 0; }

export function drawWallTile(ctx, x, y, tx, ty, open) {
  ctx.fillStyle = C.wall;
  ctx.fillRect(x, y, TILE, TILE);
  const h = hash(tx, ty);
  ctx.fillStyle = C.wallDark; // speckle texture
  for (let i = 0; i < 3; i++) {
    const v = (h >> (i * 7)) & 0x3f;
    ctx.fillRect(x + (v & 7) * 4, y + ((v >> 3) & 7) * 4, 4, 4);
  }
  ctx.fillStyle = C.wallEdge;
  if (open.left) ctx.fillRect(x, y, 4, TILE);
  if (open.right) ctx.fillRect(x + TILE - 4, y, 4, TILE);
  if (open.down) ctx.fillRect(x, y + TILE - 4, TILE, 4);
  if (open.up) {
    ctx.fillStyle = C.ecto;
    ctx.fillRect(x, y, TILE, 4);
    if (h & 1) ctx.fillRect(x + 4 + (h % 5) * 4, y + 4, 4, 4 + (h % 3) * 4); // drip
  }
}

const open = { up: false, down: false, left: false, right: false };
function tileOpen(grid, groups, tx, ty) {
  open.up = !isWallish(grid, groups, tx, ty - 1);
  open.down = !isWallish(grid, groups, tx, ty + 1);
  open.left = !isWallish(grid, groups, tx - 1, ty);
  open.right = !isWallish(grid, groups, tx + 1, ty);
  return open;
}

export function drawSpikes(ctx, x, y, dir, k = 1) {
  const h = 18 * k;
  if (h < 1) return;
  for (let i = 0; i < 2; i++) {
    const sx = x + 2 + i * 14;
    ctx.fillStyle = C.spike;
    ctx.beginPath();
    if (dir === "up") { ctx.moveTo(sx, y + TILE); ctx.lineTo(sx + 7, y + TILE - h); ctx.lineTo(sx + 14, y + TILE); }
    else { ctx.moveTo(sx, y); ctx.lineTo(sx + 7, y + h); ctx.lineTo(sx + 14, y); }
    ctx.fill();
    ctx.fillStyle = C.spikeDark;
    if (dir === "up") ctx.fillRect(sx + 7, y + TILE - h * 0.6, 3, h * 0.6);
    else ctx.fillRect(sx + 7, y, 3, h * 0.6);
  }
}

function drawBackground(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, C.bgTop);
  g.addColorStop(1, C.bgBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = "rgba(138,240,198,0.07)"; // far-off haunted windows
  for (let i = 0; i < 26; i++) {
    const h = hash(i, 7);
    ctx.fillRect((h % VIEW_W) & ~3, ((h >> 10) % 300) & ~3, 4, 4);
  }
  ctx.fillStyle = "rgba(234,242,248,0.1)"; // crescent moon, in 4px steps
  for (let y = -24; y < 24; y += 4) {
    for (let x = -24; x < 24; x += 4) {
      const inMoon = x * x + y * y < 24 * 24;
      const inBite = (x - 12) * (x - 12) + (y + 6) * (y + 6) < 20 * 20;
      if (inMoon && !inBite) ctx.fillRect(800 + x, 90 + y, 4, 4);
    }
  }
}

// Static layer (background, walls, static spikes, signs), cached per map.
const bakeCache = new Map();
export function bakeLevel(run) {
  const key = run.grid;
  let cv = bakeCache.get(key);
  if (cv) return cv;
  cv = makeCanvas(VIEW_W, VIEW_H);
  const ctx = cv.getContext("2d");
  drawBackground(ctx);
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const c = run.grid[ty][tx];
      const x = tx * TILE, y = ty * TILE;
      if (c === "#") drawWallTile(ctx, x, y, tx, ty, tileOpen(run.grid, run.groups, tx, ty));
      else if (c === "^") drawSpikes(ctx, x, y, "up");
      else if (c === "v") drawSpikes(ctx, x, y, "down");
    }
  }
  ctx.font = `bold 13px ${FONT}`;
  ctx.textAlign = "center";
  for (const s of run.signs) {
    ctx.fillStyle = C.dim;
    ctx.fillText(s.text, s.x * TILE + TILE / 2, s.y * TILE + TILE / 2);
  }
  bakeCache.set(key, cv);
  return cv;
}

export function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}

// ---------- dynamic world ----------
export function drawDoor(ctx, tx, ty, t) {
  const x = tx * TILE + 4, y = ty * TILE - 12;
  const glow = 0.25 + 0.15 * Math.sin(t * 4);
  ctx.fillStyle = `rgba(242,166,90,${glow})`;
  ctx.fillRect(x - 4, y - 4, 32, 52);
  ctx.fillStyle = C.door;
  ctx.fillRect(x, y, 24, 44);
  ctx.fillStyle = C.doorDark;
  ctx.fillRect(x + 4, y + 4, 16, 40);
  ctx.fillStyle = C.door;
  ctx.fillRect(x + 14, y + 24, 4, 4);
  ctx.fillStyle = C.pass;
  ctx.font = `bold 10px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("EXIT", x + 12, y - 6);
}

function drawGroups(ctx, run, t) {
  for (const k in run.groups) {
    const g = run.groups[k];
    if (!g.visible) continue;
    for (const [tx, ty] of g.tiles) {
      const x = tx * TILE, y = ty * TILE + g.offY;
      if (g.spike) { drawSpikes(ctx, x, y, g.spike, g.anim); continue; }
      if (g.look === "flaky") { drawFlaky(ctx, x, y, g, t); continue; }
      drawWallTile(ctx, x, y, tx, ty, tileOpen(run.grid, run.groups, tx, ty));
    }
    if (g.look === "flaky") {
      const [tx, ty] = g.tiles[0];
      const n = g.tiles.length;
      ctx.font = `bold 11px ${FONT}`;
      ctx.textAlign = "center";
      ctx.fillStyle = g.solid ? (g.warn && Math.floor(t * 12) % 2 ? C.fail : C.pass) : C.fail;
      ctx.fillText(g.solid ? (g.warn ? "FLAKY" : "PASS") : "FAIL", (tx + n / 2) * TILE, ty * TILE + 20);
    }
  }
}

function drawFlaky(ctx, x, y, g, t) {
  if (g.solid) {
    const blink = g.warn && Math.floor(t * 12) % 2;
    ctx.fillStyle = blink ? "#3a2230" : "#1d3a2e";
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = blink ? C.fail : C.pass;
    ctx.fillRect(x, y, TILE, 4);
    ctx.fillRect(x, y + TILE - 4, TILE, 4);
  } else {
    ctx.fillStyle = "rgba(255,92,108,0.35)";
    for (let i = 0; i < TILE; i += 8) { ctx.fillRect(x + i, y, 4, 4); ctx.fillRect(x + i, y + TILE - 4, 4, 4); }
  }
}

function drawRects(ctx, run) {
  for (const r of run.rects) {
    for (let y = 0; y < r.h; y += TILE) {
      for (let x = 0; x < r.w; x += TILE) {
        open.up = y === 0 && !r.deadly && r.y > TILE; open.down = y + TILE >= r.h;
        open.left = x === 0; open.right = x + TILE >= r.w;
        drawWallTile(ctx, r.x + x, r.y + y, (r.x + x) / TILE, Math.round((r.y + y) / TILE), open);
      }
    }
  }
}

export function drawWorld(ctx, run, fx, t) {
  ctx.drawImage(bakeLevel(run), 0, 0);
  drawGroups(ctx, run, t);
  drawRects(ctx, run);
  drawDoor(ctx, run.exit.tx, run.exit.ty, t);
  if (!run.dead) {
    const p = run.player;
    const bob = p.onGround ? 0 : Math.sin(t * 10) * 1.5;
    drawGhost(ctx, p.x - 4, p.y - 4 + bob, { face: p.face, t, flip: p.gdir < 0 });
  }
  drawParticles(ctx, fx.particles);
}

// ---------- particles ----------
export function spawnBurst(particles, x, y, n, color, speed = 260) {
  for (let i = 0; i < n; i++) {
    if (particles.length > 220) particles.shift();
    const a = Math.random() * Math.PI * 2, s = speed * (0.3 + Math.random() * 0.7);
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, life: 0.5 + Math.random() * 0.4, max: 0.9, color, size: 4 });
  }
}

export function updateParticles(particles, dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const q = particles[i];
    q.life -= dt;
    if (q.life <= 0) { particles.splice(i, 1); continue; }
    q.vy += 900 * dt;
    q.x += q.vx * dt; q.y += q.vy * dt;
  }
}

function drawParticles(ctx, particles) {
  for (const q of particles) {
    ctx.globalAlpha = Math.min(1, q.life / 0.3);
    ctx.fillStyle = q.color;
    ctx.fillRect(q.x & ~1, q.y & ~1, q.size, q.size);
  }
  ctx.globalAlpha = 1;
}
