import type { ItemModel } from '../../../models/contract';
import type { MotionOpts } from '../../../models/motion';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A wooden post on a round stone base (1x1) with a bunch of balloons tied to it with strings. The strings and
// balloons sway together about the knot where they are tied.
const BASE = { r: 0.3, h: 0.06 };
const POST = { r: 0.05, h: 0.9 };
const KNOT = [0, 0.84, 0] as const; // where the strings are tied (also the sway pivot)
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, KNOT[1], 0], amount: 0.09 };
const BALLOON = { r: 0.15, stretch: 1.2 };
// x, z offset of each balloon from the post, height of its centre, colour
const BALLOONS: readonly { x: number; z: number; y: number; color: PaletteColor }[] = [
  { x: 0.0, z: 0.0, y: 1.72, color: 'red' },
  { x: 0.24, z: 0.12, y: 1.5, color: 'sunYellow' },
  { x: -0.2, z: 0.2, y: 1.48, color: 'blue' },
  { x: 0.02, z: -0.28, y: 1.46, color: 'pink' },
  { x: -0.22, z: -0.14, y: 1.62, color: 'lime' },
  { x: 0.24, z: -0.16, y: 1.58, color: 'orange' },
];

/** ลูกโป่งผูกเสา: post with a bunch of balloons tied to it. */
export const item: ItemModel = {
  id: 'balloon-post',
  name: 'ลูกโป่งผูกเสา',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(BASE.r, BASE.r + 0.03, BASE.h, [0, BASE.h / 2, 0], 'stone', { segments: 12 }),
      kit.cylinder(POST.r, POST.r, POST.h, [0, POST.h / 2, 0], 'wood', { segments: 8 }),
      kit.sphere(0.065, [0, POST.h + 0.02, 0], 'sunYellow', { detail: 0 }),
      kit.cylinder(POST.r + 0.01, POST.r + 0.01, 0.05, [0, 0.4, 0], 'red', { segments: 8 }),
    ];
    for (const b of BALLOONS) {
      const bottom = b.y - BALLOON.r * BALLOON.stretch;
      parts.push(
        kit.sphere(BALLOON.r, [b.x, b.y, b.z], b.color, { scale: [1, BALLOON.stretch, 1], motion: SWAY }),
        rod(kit, [KNOT[0], KNOT[1], KNOT[2]], [b.x, bottom, b.z], 0.007, 'white', { segments: 4 }),
      );
    }
    return kit.finish(parts);
  },
};
