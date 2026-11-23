import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { aim, rod } from '../../../models/parts';

// A round umbrella stand (1×1) with three closed umbrellas leaning out of it: red, sky blue and yellow,
// each with a pointed canopy, and a brass tip.
const STAND_H = 0.5;
const R = 0.3;

const UMBRELLAS: Array<{ color: PaletteColor; base: Vec3; dir: Vec3 }> = [
  { color: 'red', base: [-0.04, 0.12, -0.12], dir: [0.12, 1, -0.2] },
  { color: 'skyBlue', base: [0.04, 0.12, 0.08], dir: [0.2, 1, 0.14] },
  { color: 'sunYellow', base: [-0.1, 0.12, 0.12], dir: [-0.05, 1, 0.3] },
];

/** ที่วางร่ม: round stand with three colourful umbrellas. */
export const item: ItemModel = {
  id: 'umbrella-stand',
  name: 'ที่วางร่ม',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit: StyleKit) => {
    const parts: Part[] = [
      kit.cylinder(R + 0.04, R + 0.04, 0.04, [0, 0.02, 0], 'charcoal', { segments: 16 }),
      kit.cylinder(R, R, STAND_H - 0.04, [0, 0.04 + (STAND_H - 0.04) / 2, 0], 'teal', { segments: 16 }),
      kit.cylinder(R + 0.03, R + 0.03, 0.05, [0, STAND_H - 0.025, 0], 'mint', { segments: 16 }),
      kit.cylinder(R - 0.03, R - 0.03, 0.01, [0, STAND_H + 0.002, 0], 'charcoal', { segments: 16 }),
      kit.box([0.02, 0.12, 0.18], [R + 0.005, 0.28, 0], 'sunYellow'), // front stripe
      kit.box([0.02, 0.12, 0.18], [R + 0.005, 0.28, 0.26], 'pink'),
      kit.box([0.02, 0.12, 0.18], [R + 0.005, 0.28, -0.26], 'lime'),
    ];
    // leaning umbrellas: shaft from inside the stand, a long-cone canopy and a brass tip
    for (const { color, base, dir } of UMBRELLAS) {
      const len = Math.hypot(...dir);
      const unit: Vec3 = [dir[0] / len, dir[1] / len, dir[2] / len];
      const at = (s: number): Vec3 => [base[0] + unit[0] * s, base[1] + unit[1] * s, base[2] + unit[2] * s];
      const total = 1.0;
      const tip = at(total);
      parts.push(
        rod(kit, base, at(total - 0.05), 0.014, 'charcoal', { segments: 6 }),
        kit.cone(0.07, 0.5, at(0.58), color, { segments: 8, rotate: aim(unit) }),
        kit.sphere(0.02, tip, 'brass', { detail: 0 }),
        kit.sphere(0.03, at(0.31), color, { detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};
