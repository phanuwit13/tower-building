import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { quadruped } from './cow-pen';

const MAT_H = 0.03;

/** หมาบ้าน: a friendly tan dog (big head, floppy ears, muzzle, collar, curled tail) lying on a teal mat beside a red food bowl. */
export const item: ItemModel = {
  id: 'village-dog',
  name: 'หมาบ้าน',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.9, MAT_H, 0.62], [-0.03, MAT_H / 2, -0.15], 'teal'),
      kit.box([0.78, MAT_H + 0.005, 0.08], [-0.03, (MAT_H + 0.005) / 2, -0.15], 'sunYellow'),
      kit.cylinder(0.12, 0.09, 0.07, [0.28, 0.035, 0.36], 'red', { segments: 10 }),
      kit.cylinder(0.09, 0.09, 0.02, [0.28, 0.07, 0.36], 'sand', { segments: 10 }),
    ];
    parts.push(
      ...quadruped(kit, MAT_H, {
        x: -0.1, z: -0.15, yaw: -0.35, len: 0.5, wid: 0.26, hgt: 0.22, leg: 0, color: 'wood', legColor: 'cream', head: 0.14, muzzle: 'cream', snout: 1.35,
        ear: 'flop', earColor: 'woodDark', tail: 'wood', collar: 'red', spotColor: 'woodDark', spots: [{ f: -0.05, s: 0.05, r: 0.07 }],
      }),
    );
    return kit.finish(parts);
  },
};
