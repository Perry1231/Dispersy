// Генерує фірмову іконку Dispersy (градієнтна куля) у форматах .ico та .png.
// Запуск: node scripts/make-icon.mjs

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'build');

// ---------- PNG-енкодер (без зовнішніх залежностей) ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // глибина кольору
  ihdr[9] = 6;  // RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // фільтр None
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- Малюємо логотип ----------
const VIOLET = [139, 124, 248];
const CYAN = [76, 201, 240];

const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
const smoothstep = (d, outer, inner) => {
  if (d <= inner) return 1;
  if (d >= outer) return 0;
  const t = (d - inner) / (outer - inner);
  return 1 - t * t * (3 - 2 * t);
};

function draw(size) {
  const px = Buffer.alloc(size * size * 4);
  const c = size / 2;
  const R = size * 0.40;        // радіус кулі
  const glowR = R * 1.26;       // м'яке світіння навколо

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - c;
      const dy = y - c;
      const d = Math.hypot(dx, dy);
      const i = (y * size + x) * 4;

      // Діагональний градієнт: фіолетовий (верх-ліво) -> блакитний (низ-право)
      let t = ((dx + dy) / (2 * R * 1.41421356) + 1) / 2;
      t = Math.max(0, Math.min(1, t));
      let r = VIOLET[0] + (CYAN[0] - VIOLET[0]) * t;
      let g = VIOLET[1] + (CYAN[1] - VIOLET[1]) * t;
      let b = VIOLET[2] + (CYAN[2] - VIOLET[2]) * t;

      const edge = smoothstep(d, R + 0.8, R - 0.8);

      if (edge > 0) {
        // Затемнення до краю кулі — об'єм
        const rim = Math.min(1, d / R);
        const shade = 1 - 0.3 * Math.pow(rim, 2.4);
        r *= shade; g *= shade; b *= shade;
        // Світловий відблиск зверху-ліворуч
        const hl = Math.max(0, (-(dx + dy) / (2 * R * 1.41421356) + 1) / 2);
        const add = 0.38 * hl * hl * (1 - rim);
        r += (255 - r) * add * 0.55;
        g += (255 - g) * add * 0.55;
        b += (255 - b) * add * 0.7;
        px[i] = clamp(r); px[i + 1] = clamp(g); px[i + 2] = clamp(b);
        px[i + 3] = Math.round(255 * edge);
      } else if (d < glowR) {
        // Світіння навколо кулі
        const f = 1 - (d - R) / (glowR - R);
        px[i] = clamp(r); px[i + 1] = clamp(g); px[i + 2] = clamp(b);
        px[i + 3] = Math.round(110 * f * f);
      }
    }
  }
  return px;
}

// ---------- Збірка .ico (кілька розмірів, PNG-записи — стандарт Vista+) ----------
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);          // reserved
  header.writeUInt16LE(1, 2);          // тип: іконка
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = [];
  const blobs = [];
  for (const im of images) {
    const e = Buffer.alloc(16);
    e[0] = im.size === 256 ? 0 : im.size;
    e[1] = im.size === 256 ? 0 : im.size;
    e.writeUInt16LE(1, 4);             // color planes
    e.writeUInt16LE(32, 6);            // біт на піксель
    e.writeUInt32LE(im.png.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    blobs.push(im.png);
    offset += im.png.length;
  }
  return Buffer.concat([header, ...entries, ...blobs]);
}

mkdirSync(OUT_DIR, { recursive: true });

const sizes = [16, 24, 32, 48, 64, 128, 256];
const images = sizes.map((size) => ({
  size,
  png: encodePng(size, size, draw(size)),
}));

writeFileSync(join(OUT_DIR, 'icon.ico'), buildIco(images));
writeFileSync(join(OUT_DIR, 'icon.png'), images[images.length - 1].png);
console.log(`OK: build/icon.ico (${sizes.join(', ')} px) + build/icon.png`);
