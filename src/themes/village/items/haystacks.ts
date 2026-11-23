import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Three round straw stacks standing on a patch of golden stubble.
const GROUND_H = 0.025;
/** [x, z, radius, body height, cone height] */
const STACKS: Array<[number, number, number, number, number]> = [
  [-0.4, -0.38, 0.45, 0.5, 0.38],
  [0.45, -0.18, 0.4, 0.44, 0.34],
  [0.0, 0.5, 0.42, 0.47, 0.36],
];

/** กองฟาง: three round straw stacks on golden stubble. */
export const item: ItemModel = {
  id: 'haystacks',
  name: 'กองฟาง',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.96, GROUND_H, 1.96], [0, GROUND_H / 2, 0], 'sand')];
    // stubble stripes
    for (let i = 0; i < 8; i++) parts.push(kit.box([0.1, 0.012, 1.8], [-0.84 + i * 0.24, GROUND_H + 0.006, 0], 'sunYellow'));
    for (const [x, z, r, h, ch] of STACKS) {
      parts.push(
        kit.cylinder(r - 0.03, r, h, [x, GROUND_H + h / 2, z], 'sunYellow', { segments: 12 }),
        kit.cylinder(r + 0.015, r + 0.015, 0.04, [x, GROUND_H + h * 0.3, z], 'brass', { segments: 12 }), // binding rope
        kit.cylinder(r - 0.1, r - 0.1, 0.04, [x, GROUND_H + h * 0.72, z], 'brass', { segments: 12 }),
        kit.cone(r + 0.02, ch, [x, GROUND_H + h + ch / 2, z], 'sand', { segments: 12 }),
        kit.sphere(0.05, [x, GROUND_H + h + ch + 0.01, z], 'sunYellow', { detail: 0 }), // the tuft on top
      );
    }
    return kit.finish(parts);
  },
};
