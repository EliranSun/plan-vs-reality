#!/usr/bin/env node
// Pure Node.js PNG generator — no external dependencies needed
import { writeFileSync } from 'fs';
import { deflateSync } from 'zlib';

// ─── CRC32 ───────────────────────────────────────────────────────────────────
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[i] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.allocUnsafe(4); len.writeUInt32BE(data.length);
  const crc = Buffer.allocUnsafe(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

// ─── PNG encoder ─────────────────────────────────────────────────────────────
function encodePNG(w, h, rgba) {
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // scanlines with filter-byte prefix
  const raw = Buffer.allocUnsafe((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter: None
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── Drawing helpers ─────────────────────────────────────────────────────────
function hex(h) {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lerp(a, b, t) { return a + (b - a) * t; }
function lerpColor(c1, c2, t) { return c1.map((v, i) => Math.round(lerp(v, c2[i], t))); }

// Premultiplied alpha blend: src over dst
function blend(dst, src, a) {
  const ia = 1 - a;
  return [
    Math.round(src[0] * a + dst[0] * ia),
    Math.round(src[1] * a + dst[1] * ia),
    Math.round(src[2] * a + dst[2] * ia),
  ];
}

function setPixel(buf, w, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= w || y >= Math.floor(buf.length / (w * 4))) return;
  const i = (y * w + x) * 4;
  // blend over existing
  const ea = buf[i + 3] / 255;
  const sa = a / 255;
  const oa = sa + ea * (1 - sa);
  if (oa === 0) return;
  buf[i]     = Math.round((r * sa + buf[i]     * ea * (1 - sa)) / oa);
  buf[i + 1] = Math.round((g * sa + buf[i + 1] * ea * (1 - sa)) / oa);
  buf[i + 2] = Math.round((b * sa + buf[i + 2] * ea * (1 - sa)) / oa);
  buf[i + 3] = Math.round(oa * 255);
}

// Anti-aliased filled circle
function fillCircle(buf, w, cx, cy, r, color, alpha = 1) {
  const [cr, cg, cb] = color;
  for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r + 1); y++) {
    for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const a = Math.max(0, Math.min(1, r - d + 0.5)) * alpha;
      if (a > 0) setPixel(buf, w, x, y, cr, cg, cb, Math.round(a * 255));
    }
  }
}

// Anti-aliased rounded rectangle fill
function fillRoundRect(buf, w, h, x, y, rw, rh, r, color, alpha = 1) {
  const [cr, cg, cb] = color;
  // Distance to rounded rect edge
  function dist(px, py) {
    const qx = Math.max(x + r, Math.min(x + rw - r, px));
    const qy = Math.max(y + r, Math.min(y + rh - r, py));
    return Math.sqrt((px - qx) ** 2 + (py - qy) ** 2);
  }
  for (let py = Math.max(0, y - 1); py <= Math.min(h - 1, y + rh + 1); py++) {
    for (let px = Math.max(0, x - 1); px <= Math.min(w - 1, x + rw + 1); px++) {
      const d = dist(px + 0.5, py + 0.5);
      const a = Math.max(0, Math.min(1, r - d + 0.5)) * alpha;
      if (a > 0) setPixel(buf, w, px, py, cr, cg, cb, Math.round(a * 255));
    }
  }
}

// Gradient rounded rect (vertical gradient)
function fillRoundRectGrad(buf, W, H, x, y, rw, rh, r, colorTop, colorBot, alpha = 1) {
  function dist(px, py) {
    const qx = Math.max(x + r, Math.min(x + rw - r, px));
    const qy = Math.max(y + r, Math.min(y + rh - r, py));
    return Math.sqrt((px - qx) ** 2 + (py - qy) ** 2);
  }
  for (let py = Math.max(0, y - 1); py <= Math.min(H - 1, y + rh + 1); py++) {
    for (let px = Math.max(0, x - 1); px <= Math.min(W - 1, x + rw + 1); px++) {
      const d = dist(px + 0.5, py + 0.5);
      const a = Math.max(0, Math.min(1, r - d + 0.5)) * alpha;
      if (a > 0) {
        const t = (py - y) / rh;
        const [cr, cg, cb] = lerpColor(colorTop, colorBot, t);
        setPixel(buf, W, px, py, cr, cg, cb, Math.round(a * 255));
      }
    }
  }
}

// Anti-aliased line
function drawLine(buf, W, x0, y0, x1, y1, thick, color, alpha = 1) {
  const [cr, cg, cb] = color;
  const dx = x1 - x0, dy = y1 - y0;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len, ny = dx / len; // normal
  const steps = Math.ceil(len) * 2;
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const cx = x0 + dx * t, cy = y0 + dy * t;
    const hw = thick / 2 + 1;
    for (let oy = -hw; oy <= hw; oy++) {
      for (let ox = -hw; ox <= hw; ox++) {
        const px = Math.round(cx + ox), py = Math.round(cy + oy);
        // distance to line segment
        const dot = ox * nx + oy * ny; // perpendicular distance isn't exactly this
        // simpler: distance from (px,py) to the line center point
        const perpDist = Math.abs((px - cx) * nx + (py - cy) * ny);
        const a = Math.max(0, Math.min(1, thick / 2 - perpDist + 0.5)) * alpha;
        if (a > 0) setPixel(buf, W, px, py, cr, cg, cb, Math.round(a * 255));
      }
    }
  }
}

// ─── Render icon ─────────────────────────────────────────────────────────────
function renderIcon(size) {
  const W = size, H = size;
  const buf = Buffer.alloc(W * H * 4, 0); // fully transparent

  const scale = size / 512;
  const radius = Math.round(112 * scale);

  // Background
  fillRoundRect(buf, W, H, 0, 0, W, H, radius, hex('#0f1117'), 1);

  // Subtle inner glow on bg (slightly lighter edge)
  // Skip for simplicity at small sizes

  // ── Bars ──────────────────────────────────────────────────────────────────
  const barW    = Math.round(108 * scale);
  const barR    = Math.round(14 * scale);
  const baseY   = Math.round(368 * scale);

  // Plan bar (left, blue indigo gradient)
  const planX  = Math.round(118 * scale);
  const planY  = Math.round(148 * scale);
  const planH  = Math.round(220 * scale);
  fillRoundRectGrad(buf, W, H, planX, planY, barW, planH, barR,
    hex('#818cf8'), hex('#60a5fa'), 0.92);

  // Reality bar (right, green gradient) — shorter
  const realX  = Math.round(286 * scale);
  const realY  = Math.round(198 * scale);
  const realH  = Math.round(170 * scale);
  fillRoundRectGrad(buf, W, H, realX, realY, barW, realH, barR,
    hex('#6ee7b7'), hex('#34d399'), 0.92);

  // Baseline
  const baseH = Math.max(2, Math.round(3 * scale));
  fillRoundRect(buf, W, H, Math.round(96 * scale), baseY, Math.round(320 * scale), baseH, 1,
    [255, 255, 255], 0.15);

  // Dashed line connecting the tops of both bars
  const dashLen  = Math.round(8 * scale);
  const gapLen   = Math.round(6 * scale);
  const lx0 = planX + barW;
  const ly0 = planY;
  const lx1 = realX;
  const ly1 = realY;
  const totalLen = Math.sqrt((lx1 - lx0) ** 2 + (ly1 - ly0) ** 2);
  const totalDash = dashLen + gapLen;
  const numDashes = Math.floor(totalLen / totalDash);
  for (let d = 0; d < numDashes; d++) {
    const t0 = (d * totalDash) / totalLen;
    const t1 = (d * totalDash + dashLen) / totalLen;
    drawLine(buf, W,
      lx0 + (lx1 - lx0) * t0, ly0 + (ly1 - ly0) * t0,
      lx0 + (lx1 - lx0) * t1, ly0 + (ly1 - ly0) * t1,
      Math.max(1.5, 3 * scale), [255, 255, 255], 0.28);
  }

  // Top cap dots
  const dotR = Math.round(7 * scale);
  fillCircle(buf, W, planX + barW / 2, planY, dotR, [255, 255, 255], 0.6);
  fillCircle(buf, W, realX + barW / 2, realY, dotR, [255, 255, 255], 0.6);

  return buf;
}

// ─── Generate files ──────────────────────────────────────────────────────────
for (const [name, size] of [['apple-touch-icon', 180], ['favicon-512', 512], ['favicon-192', 192]]) {
  const rgba = renderIcon(size);
  const png  = encodePNG(size, size, rgba);
  writeFileSync(`public/${name}.png`, png);
  console.log(`✓ public/${name}.png  (${size}×${size})`);
}

console.log('Done.');
