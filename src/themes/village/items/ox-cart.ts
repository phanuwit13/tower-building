import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod, wheel } from '../../../models/parts';

const R = 0.4; // wheel radius to the middle of the tyre
const TUBE = 0.04;
const WHEEL_X = 0.37;
const BED_Y = 0.52;

/** เกวียน: an old wooden cart with big spoked wheels, left as a decoration with flowers (no animal). */
export const item: ItemModel = {
  id: 'ox-cart',
  name: 'เกวียน',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const s of [-1, 1]) {
      parts.push(...wheel(kit, { at: [s * WHEEL_X, R + TUBE, 0.05], radius: R, tube: TUBE, axis: 'x', color: 'woodDark',
        hubColor: 'sunYellow', hubRadius: 0.07, hubLength: 0.14, spokes: 3, spokeColor: 'wood', spokeWidth: 0.05, spokeThick: 0.04, tubularSegments: 16 }));
    }
    parts.push(
      kit.cylinder(0.035, 0.035, 0.86, [0, R + TUBE, 0.05], 'bark', { rotate: [0, 0, Math.PI / 2], segments: 8 }),
      kit.box([0.6, 0.06, 1.5], [0, BED_Y, -0.05], 'wood'),
      kit.box([0.06, 0.04, 1.6], [-0.24, BED_Y - 0.06, -0.05], 'woodDark'),
      kit.box([0.06, 0.04, 1.6], [0.24, BED_Y - 0.06, -0.05], 'woodDark'),
    );
    // low sides and end boards
    for (const s of [-1, 1]) parts.push(kit.box([0.04, 0.14, 1.5], [s * 0.3, BED_Y + 0.1, -0.05], 'woodDark'));
    for (const s of [-1, 1]) parts.push(kit.box([0.64, 0.14, 0.04], [0, BED_Y + 0.1, -0.05 + s * 0.75], 'woodDark'));
    // two long shafts reaching forward (+z) down to the ground, with a prop
    for (const s of [-1, 1]) {
      parts.push(
        rod(kit, [s * 0.2, BED_Y - 0.06, 0.5], [s * 0.2, 0.05, 0.96], 0.03, 'woodDark', { segments: 6 }),
        kit.box([0.1, 0.05, 0.1], [s * 0.2, 0.025, 0.95], 'bark'),
      );
    }
    // flowers heaped in the bed
    const flowers: Array<[number, number, PaletteColor]> = [[-0.12, -0.5, 'pink'], [0.1, -0.35, 'sunYellow'], [-0.1, -0.15, 'purple'], [0.12, 0.0, 'red'], [-0.08, 0.2, 'sunYellow'], [0.1, 0.35, 'pink']];
    parts.push(
      kit.sphere(0.2, [0, BED_Y + 0.14, -0.4], 'leaf', { detail: 0, scale: [1.2, 0.7, 1.4] }),
      kit.sphere(0.2, [0, BED_Y + 0.14, 0.2], 'leafDark', { detail: 0, scale: [1.2, 0.7, 1.4] }),
    );
    for (const [x, z, c] of flowers) parts.push(kit.sphere(0.065, [x, BED_Y + 0.27, z], c, { detail: 0 }));
    return kit.finish(parts);
  },
};
