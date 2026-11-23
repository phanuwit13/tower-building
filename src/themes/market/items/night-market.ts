import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A night market (2×3, long side along z): two rows of three stalls with bright canopies facing a narrow aisle,
// and criss-crossed string lights that chase over the aisle.
const BASE = { w: 1.96, h: 0.03, d: 2.96 };
const STALL = { x: 0.62, w: 0.72, d: 0.8, tilt: 0.2, canopyY: 0.78 };
const STALL_Z = [-0.95, 0, 0.95];
const POLE = { x: 0.2, h: 1.1, z: [-1.42, -0.475, 0.475, 1.42] };
const CANOPY: PaletteColor[][] = [
  ['red', 'sunYellow', 'blue'],
  ['pink', 'lime', 'purple'],
];
const GOODS: PaletteColor[][] = [
  ['orange', 'red', 'lime'],
  ['sunYellow', 'pink', 'blue'],
];

/** ตลาดนัดกลางคืน: stalls with colourful canopies under criss-crossed chase lights. */
export const item: ItemModel = {
  id: 'night-market',
  name: 'ตลาดนัดกลางคืน',
  category: 'food',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stone')];
    [-1, 1].forEach((s, row) => {
      STALL_Z.forEach((z, i) => {
        const canopy = CANOPY[row][i];
        // canopy slopes down towards the aisle; height at the aisle edge:
        const front = STALL.canopyY - (STALL.w / 2 - 0.04) * Math.sin(STALL.tilt);
        parts.push(
          kit.box([0.04, 0.78, STALL.d], [s * 0.93, BASE.h + 0.39, z], 'cream'), // back wall
          kit.box([0.28, 0.3, 0.7], [s * 0.46, BASE.h + 0.15, z], 'wood'), // counter
          kit.box([0.3, 0.03, 0.72], [s * 0.46, BASE.h + 0.315, z], 'woodDark'),
          kit.box([STALL.w, 0.04, STALL.d], [s * STALL.x, STALL.canopyY, z], canopy, { rotate: [0, 0, s * STALL.tilt] }),
          kit.box([0.03, 0.09, STALL.d], [s * (STALL.x - 0.37), front - 0.06, z], 'white'), // valance
          kit.box([0.04, 0.04, STALL.d - 0.04], [s * (STALL.x - 0.38), front - 0.01, z], canopy, { glow: true }), // glowing canopy edge
          kit.sphere(0.055, [s * 0.46, BASE.h + 0.37, z - 0.2], GOODS[row][i], { detail: 0 }),
          kit.sphere(0.055, [s * 0.46, BASE.h + 0.37, z + 0.2], GOODS[row][(i + 1) % 3], { detail: 0 }),
          kit.sphere(0.045, [s * 0.5, front - 0.1, z], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }), // hanging lamp
        );
        for (const dz of [-0.37, 0.37]) parts.push(kit.box([0.035, front - BASE.h - 0.02, 0.035], [s * 0.3, (BASE.h + front - 0.02) / 2, z + dz], 'woodDark'));
      });
    });
    // poles on both sides of the aisle, a string along each side and criss-cross strings over it
    for (const s of [-1, 1]) for (const z of POLE.z) parts.push(kit.cylinder(0.025, 0.025, POLE.h, [s * POLE.x, BASE.h + POLE.h / 2, z], 'charcoal', { segments: 8 }));
    const top = BASE.h + POLE.h;
    const run = (a: [number, number, number], b: [number, number, number], count: number, color: PaletteColor) => {
      parts.push(rod(kit, a, b, 0.012, 'stoneDark', { segments: 4 }));
      for (let index = 0; index < count; index++) {
        const t = (index + 0.5) / count;
        const p: [number, number, number] = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - 0.07, a[2] + (b[2] - a[2]) * t];
        parts.push(kit.sphere(0.065, p, color, { detail: 0, glow: true, light: 'chase', chase: { index, count } }));
      }
    };
    for (const s of [-1, 1]) run([s * POLE.x, top, POLE.z[0]], [s * POLE.x, top, POLE.z[3]], 9, s < 0 ? 'orange' : 'sunYellow');
    const cols: PaletteColor[] = ['pink', 'blue', 'lime', 'orange', 'purple', 'red'];
    for (let i = 0; i < 3; i++) {
      run([-POLE.x, top, POLE.z[i]], [POLE.x, top, POLE.z[i + 1]], 5, cols[i * 2]);
      run([POLE.x, top, POLE.z[i]], [-POLE.x, top, POLE.z[i + 1]], 5, cols[i * 2 + 1]);
    }
    // a glowing star over the entrance end (two squares, one turned an eighth of a turn)
    const sz = POLE.z[3];
    parts.push(
      kit.box([0.03, 0.2, 0.03], [0, top + 0.1, sz], 'charcoal'),
      kit.box([0.2, 0.2, 0.03], [0, top + 0.3, sz], 'sunYellow', { glow: true, light: 'breathe' }),
      kit.box([0.2, 0.2, 0.03], [0, top + 0.3, sz], 'sunYellow', { glow: true, light: 'breathe', rotate: [0, 0, Math.PI / 4] }),
    );
    return kit.finish(parts);
  },
};
