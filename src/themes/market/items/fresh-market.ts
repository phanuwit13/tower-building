import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { gableRoof } from '../../../models/parts';

// An open market hall (2×3, long side along z, front +x): a big red roof on posts, two rows of
// stalls (fruit, veg, fish crates) and strings of breathing bulbs under the roof. An orange
// neon citrus sign stands on the ridge.
const FLOOR_H = 0.04;
const POST_X = 0.84;
const POST_Z = [-1.3, 0, 1.3];
const EAVE_Y = 1.15; // wall tops = post tops
const RISE = 0.4;
const ROOF_W = 1.7; // across x
const STALL_X = [-0.5, 0.5];
const STALL_Z = [-1.0, 0, 1.0];
const TABLE = { w: 0.5, h: 0.28, d: 0.8 };
const GOODS: Array<{ color: PaletteColor; fish?: boolean }> = [
  { color: 'red' }, { color: 'leaf' }, { color: 'sunYellow' }, { color: 'chrome', fish: true }, { color: 'orange' }, { color: 'purple' },
];
const SIGN = { x: 0, y: 2.05, z: 0.2, w: 1.5, h: 0.7, d: 0.06 };
const FRONT_BULBS: PaletteColor[] = ['red', 'sunYellow', 'lime', 'orange'];

/** ตลาดสด: an open market hall with fruit, veg and fish stalls and hanging bulbs. */
export const item: ItemModel = {
  id: 'fresh-market',
  name: 'ตลาดสด',
  category: 'food',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.94, FLOOR_H, 2.94], [0, FLOOR_H / 2, 0], 'stone')];
    for (const x of [-POST_X, POST_X]) {
      for (const z of POST_Z) parts.push(kit.cylinder(0.05, 0.05, EAVE_Y - FLOOR_H, [x, (FLOOR_H + EAVE_Y) / 2, z], 'woodDark', { segments: 6 }));
    }
    parts.push(
      ...gableRoof(kit, { at: [0, EAVE_Y, 0], length: 2.9, width: ROOF_W, rise: RISE, eave: 0.1, color: 'red', ridge: 'redDark' }),
      kit.wedge([ROOF_W, RISE, 0.04], [0, EAVE_Y + RISE / 2, -1.42], 'white'),
      kit.wedge([ROOF_W, RISE, 0.04], [0, EAVE_Y + RISE / 2, 1.42], 'white'),
    );
    // stalls: a table with a cloth top, a crate and a heap of goods
    let g = 0;
    for (const x of STALL_X) {
      for (const z of STALL_Z) {
        const goods = GOODS[g++ % GOODS.length];
        const top = FLOOR_H + TABLE.h;
        parts.push(
          kit.box([TABLE.w, TABLE.h, TABLE.d], [x, FLOOR_H + TABLE.h / 2, z], 'wood'),
          kit.box([TABLE.w + 0.04, 0.03, TABLE.d + 0.04], [x, top + 0.015, z], x > 0 ? 'white' : 'cream'),
          kit.box([0.4, 0.1, 0.6], [x, top + 0.03 + 0.05, z], 'woodDark'),
        );
        for (const dz of [-0.2, 0, 0.2]) {
          for (const dx of [-0.08, 0.08]) {
            if (goods.fish) {
              parts.push(kit.sphere(0.07, [x + dx, top + 0.15, z + dz], goods.color, { detail: 0, scale: [0.9, 0.45, 1.5] }));
            } else {
              parts.push(kit.sphere(0.065, [x + dx, top + 0.15, z + dz], goods.color, { detail: 0 }));
            }
          }
        }
      }
    }
    // hanging bulbs: three strings along z, each bulb on a short cord from the roof
    for (const x of [-0.5, 0, 0.5]) {
      const under = EAVE_Y + RISE * (1 - Math.abs(x) / (ROOF_W / 2));
      for (const z of [-1.2, -0.72, -0.24, 0.24, 0.72, 1.2]) {
        parts.push(
          kit.cylinder(0.01, 0.01, 0.2, [x, under - 0.08, z], 'charcoal', { segments: 4 }),
          kit.sphere(0.06, [x, under - 0.23, z], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }),
        );
      }
    }
    // rooftop sign: a navy board with a neon orange citrus (a ring, a segment cross and a leaf)
    const ridge = EAVE_Y + RISE;
    const boardBottom = SIGN.y - SIGN.h / 2;
    for (const dz of [-0.6, 0.6]) {
      parts.push(kit.cylinder(0.03, 0.03, boardBottom - ridge + 0.05, [0, (ridge + boardBottom) / 2 - 0.02, SIGN.z + dz], 'woodDark', { segments: 4 }));
    }
    const nx = SIGN.x + SIGN.d / 2 + 0.04;
    parts.push(
      kit.box([SIGN.d, SIGN.h, SIGN.w], [SIGN.x, SIGN.y, SIGN.z], 'navy'),
      kit.torus(0.25, 0.045, [nx, SIGN.y, SIGN.z], 'orange', { radialSegments: 4, tubularSegments: 16, rotate: [0, Math.PI / 2, 0], glow: true }),
      kit.box([0.05, 0.46, 0.05], [nx, SIGN.y, SIGN.z], 'orange', { glow: true }),
      kit.box([0.05, 0.05, 0.46], [nx, SIGN.y, SIGN.z], 'orange', { glow: true }),
      kit.sphere(0.1, [nx, SIGN.y + 0.3, SIGN.z + 0.18], 'lime', { detail: 0, scale: [0.4, 0.8, 1.4], glow: true }),
    );
    // bulbs along the front roof edge, where the camera sees them
    const EDGE_BULBS = 12;
    for (let i = 0; i < EDGE_BULBS; i++) {
      const z = -1.35 + (2.7 * i) / (EDGE_BULBS - 1);
      parts.push(kit.sphere(0.045, [0.94, EAVE_Y - 0.07, z], FRONT_BULBS[i % FRONT_BULBS.length], { detail: 0, glow: true, light: 'chase', chase: { index: i, count: EDGE_BULBS } }));
    }
    return kit.finish(parts);
  },
};
