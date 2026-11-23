import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { aim } from '../../../models/parts';
import type { MotionOpts } from '../../../models/motion';

// A small wooden stand with a pole and a cluster of seven balloons. Strings, knots and balloons
// share ONE sway pivot at the top of the pole, so the cluster leans together.
const BASE_H = 0.3;
const POLE_TOP = 0.86;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, POLE_TOP, 0], amount: 0.07 };

const GLOWING = new Set<PaletteColor>(['red', 'blue', 'purple', 'orange']); // lit from inside at night
const BALLOONS: { dx: number; dz: number; y: number; color: PaletteColor }[] = [
  { dx: 0, dz: 0, y: 1.6, color: 'red' },
  { dx: 0.2, dz: 0.05, y: 1.35, color: 'sunYellow' },
  { dx: -0.17, dz: 0.12, y: 1.4, color: 'blue' },
  { dx: 0.02, dz: -0.2, y: 1.38, color: 'pink' },
  { dx: -0.12, dz: -0.1, y: 1.12, color: 'lime' },
  { dx: 0.14, dz: 0.2, y: 1.12, color: 'purple' },
  { dx: 0.15, dz: -0.15, y: 1.1, color: 'orange' },
];

/** ลูกโป่งหน้าร้าน: a stand with a cluster of balloons. */
export const item: ItemModel = {
  id: 'balloon-stand',
  name: 'ลูกโป่งหน้าร้าน',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.8, 0.03, 0.8], [0, 0.015, 0], 'stone'),
      kit.box([0.5, BASE_H - 0.03, 0.5], [0, 0.03 + (BASE_H - 0.03) / 2, 0], 'wood'),
      kit.box([0.52, 0.05, 0.52], [0, BASE_H - 0.025, 0], 'orange', { glow: 'orange' }),
      kit.box([0.52, 0.05, 0.52], [0, 0.055, 0], 'woodDark'),
      kit.cylinder(0.03, 0.03, POLE_TOP - BASE_H, [0, (BASE_H + POLE_TOP) / 2, 0], 'white', { segments: 8 }),
      kit.sphere(0.05, [0, POLE_TOP, 0], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }),
    ];
    for (const b of BALLOONS) {
      const from: [number, number, number] = [0, POLE_TOP, 0];
      const to: [number, number, number] = [b.dx, b.y - 0.2, b.dz];
      const d: [number, number, number] = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
      parts.push(
        kit.cylinder(0.008, 0.008, Math.hypot(...d), [d[0] / 2, POLE_TOP + d[1] / 2, d[2] / 2], 'white', { segments: 4, rotate: aim(d), motion: SWAY }),
        kit.cone(0.03, 0.05, [b.dx, b.y - 0.185, b.dz], b.color, { segments: 6, rotate: [Math.PI, 0, 0], motion: SWAY }),
        kit.sphere(0.16, [b.dx, b.y, b.dz], b.color, { scale: [1, 1.18, 1], motion: SWAY, ...(GLOWING.has(b.color) ? { glow: b.color } : {}) }),
      );
    }
    return kit.finish(parts);
  },
};
