import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

// Two posts, a striped net hammock between them. The cloth and its pillow rock about the line through the two
// tie points (the z axis at END_Y), so the ends stay put and only the belly swings; at the extreme it is still
// well above the ground (the lowest point is about 0.36).
const POST_Z = 0.75;
const END_Y = 0.72;
const END_Z = 0.55;
const SAG = 0.36;
const SWING: MotionOpts = { kind: 'swing', pivot: [0, END_Y, 0], axis: [0, 0, 1], amount: 0.15 };
const N = 8;

/** เปลญวน: a net hammock between two posts; it swings gently. */
export const item: ItemModel = {
  id: 'hammock',
  name: 'เปลญวน',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const m = { motion: SWING };
    const parts: Part[] = [];
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([0.22, 0.06, 0.22], [0, 0.03, s * POST_Z], 'stone'),
        kit.cylinder(0.055, 0.065, 0.95, [0, 0.06 + 0.475 - 0.06, s * POST_Z], 'wood', { segments: 8 }),
        kit.sphere(0.07, [0, 0.95, s * POST_Z], 'sunYellow', { detail: 0 }),
        rod(kit, [0, END_Y, s * (POST_Z - 0.04)], [0, END_Y, s * END_Z], 0.016, 'stoneDark', { segments: 4 }),
      );
    }
    const pt = (i: number): [number, number] => {
      const u = (2 * i) / N - 1;
      return [-END_Z + ((2 * END_Z) * i) / N, END_Y - SAG * (1 - u * u)];
    };
    for (let i = 0; i < N; i++) {
      const [za, ya] = pt(i);
      const [zb, yb] = pt(i + 1);
      const len = Math.hypot(zb - za, yb - ya);
      const u = (2 * (i + 0.5)) / N - 1;
      const w = 0.1 + 0.3 * Math.sqrt(1 - u * u);
      parts.push(kit.box([w, 0.03, len * 1.1], [0, (ya + yb) / 2, (za + zb) / 2], i % 2 === 0 ? 'orange' : 'cream', { rotate: [-Math.atan2(yb - ya, zb - za), 0, 0], ...m }));
    }
    const [pz, py] = pt(2);
    parts.push(kit.sphere(0.11, [0, py + 0.07, pz - 0.02], 'pink', { scale: [1.1, 0.6, 1.2], ...m }));
    return kit.finish(parts);
  },
};
