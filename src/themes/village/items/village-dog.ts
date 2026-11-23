import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { quadruped } from './cow-pen';

const MAT_H = 0.03;

/** หมาบ้าน: a friendly tan dog lying on a woven mat beside a food bowl. */
export const item: ItemModel = {
  id: 'village-dog',
  name: 'หมาบ้าน',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.9, MAT_H, 0.7], [-0.02, MAT_H / 2, -0.05], 'red'),
      kit.box([0.78, MAT_H + 0.005, 0.1], [-0.02, (MAT_H + 0.005) / 2, -0.05], 'sunYellow'),
      kit.cylinder(0.1, 0.075, 0.06, [0.3, 0.03, 0.38], 'blue', { segments: 10 }),
      kit.cylinder(0.075, 0.075, 0.02, [0.3, 0.06, 0.38], 'sand', { segments: 10 }),
    ];
    parts.push(
      ...quadruped(kit, MAT_H, {
        x: -0.12, z: -0.05, yaw: -0.35, len: 0.46, wid: 0.22, hgt: 0.2, leg: 0, color: 'wood', legColor: 'cream', head: 0.1, muzzle: 'cream', snout: 1.1,
        ear: 'flop', earColor: 'woodDark', tail: 'wood', spotColor: 'woodDark', spots: [{ f: -0.05, s: 0.04, r: 0.06 }],
      }),
    );
    return kit.finish(parts);
  },
};
