import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { ICO_LOW } from '../../../models/parts';

const SAND_R = 0.96;
const POOL = { r: 0.62, h: 0.06 };
const RING_R = 0.74;
const ROCK_SQUASH = 0.7;
/** Rocks round the pool, in order: [size, colour]. */
const ROCKS: Array<[number, PaletteColor]> = [
  [0.17, 'stone'], [0.14, 'stoneDark'], [0.16, 'stone'], [0.15, 'stone'], [0.13, 'stoneDark'], [0.17, 'stone'], [0.14, 'stone'],
  [0.16, 'stoneDark'], [0.15, 'stone'], [0.13, 'stone'], [0.17, 'stoneDark'], [0.14, 'stone'], [0.16, 'stone'], [0.13, 'stoneDark'],
];
const WATER: MotionOpts = { kind: 'water', water: 'pond' };
const ISLAND = { x: 0.12, z: -0.22, r: 0.2, squash: 0.4 }; // a flat stone in the pool where the crab sits
const CRAB = { x: 0.12, z: -0.22 };
const STAR = { x: -0.18, z: 0.2, y: 0.078 };
/** Seaweed blades: [x, z, height, lean about x, lean about z, colour]. */
const WEED: Array<[number, number, number, number, number, PaletteColor]> = [
  [-0.3, -0.18, 0.26, 0.2, 0.15, 'leaf'], [-0.36, -0.1, 0.2, -0.15, 0.25, 'leafDark'], [-0.26, -0.26, 0.22, 0.3, -0.1, 'leafDark'],
  [-0.34, -0.2, 0.3, 0.1, 0.2, 'leaf'],
];

/** แอ่งหินมีปู: a ring of grey rocks round a shallow pool with a crab on a stone, a starfish and seaweed. */
export const item: ItemModel = {
  id: 'rock-pool',
  name: 'แอ่งหินมีปู',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(SAND_R, SAND_R, 0.03, [0, 0.015, 0], 'sand', { segments: 16 }),
      kit.cylinder(POOL.r, POOL.r, POOL.h, [0, POOL.h / 2, 0], 'navy', { segments: 16, motion: WATER }),
    ];
    ROCKS.forEach(([s, color], k) => {
      const a = (k / ROCKS.length) * Math.PI * 2;
      parts.push(kit.sphere(s, [RING_R * Math.cos(a), s * ROCK_SQUASH * ICO_LOW, RING_R * Math.sin(a)], color,
        { detail: 0, scale: [1.3, ROCK_SQUASH, 1.15], rotate: [0, -a + 0.4 * (k % 3), 0] }));
    });
    // the stone island and the crab (faces +x, claws up front)
    const iy = ISLAND.r * ISLAND.squash * ICO_LOW;
    const top = iy + ISLAND.r * ISLAND.squash;
    parts.push(kit.sphere(ISLAND.r, [ISLAND.x, iy, ISLAND.z], 'stoneDark', { detail: 0, scale: [1, ISLAND.squash, 0.9] }));
    const cy = top + 0.04;
    parts.push(kit.sphere(0.09, [CRAB.x, cy, CRAB.z], 'red', { detail: 0, scale: [1, 0.6, 1.3] }));
    for (const s of [-1, 1]) {
      parts.push(
        kit.sphere(0.04, [CRAB.x + 0.11, cy + 0.01, CRAB.z + s * 0.12], 'redDark', { detail: 0 }), // claw
        kit.box([0.02, 0.02, 0.06], [CRAB.x + 0.05, cy + 0.05, CRAB.z + s * 0.045], 'redDark'), // eye stalk
        kit.sphere(0.02, [CRAB.x + 0.05, cy + 0.085, CRAB.z + s * 0.045], 'white', { detail: 0 }),
      );
      for (const dx of [-0.06, 0, 0.06]) {
        parts.push(kit.box([0.025, 0.02, 0.1], [CRAB.x + dx, cy - 0.015, CRAB.z + s * 0.12], 'red'));
      }
    }
    // starfish lying on the water
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      parts.push(kit.box([0.13, 0.03, 0.055], [STAR.x + 0.065 * Math.cos(a), STAR.y, STAR.z - 0.065 * Math.sin(a)], 'orange', { rotate: [0, a, 0] }));
    }
    parts.push(kit.sphere(0.05, [STAR.x, STAR.y, STAR.z], 'orange', { detail: 0, scale: [1, 0.45, 1] }));
    // seaweed
    for (const [x, z, h, lx, lz, color] of WEED) {
      parts.push(kit.cylinder(0.012, 0.03, h, [x, h / 2 + 0.03, z], color, { segments: 4, rotate: [lx, 0, lz] }));
    }
    return kit.finish(parts);
  },
};
