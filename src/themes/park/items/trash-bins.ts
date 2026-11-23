import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const BIN_H = 0.5;
const BIN_R = 0.15;

/** ถังขยะแยกประเภท: three coloured bins in a row, each with a picture (bottle, leaf, apple) on the front. */
export const item: ItemModel = {
  id: 'trash-bins',
  name: 'ถังขยะแยกประเภท',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.5, 0.04, 0.96], [0, 0.02, 0], 'stone')];
    const bins: { z: number; body: PaletteColor; lid: PaletteColor }[] = [
      { z: -0.31, body: 'blue', lid: 'navy' },
      { z: 0, body: 'leaf', lid: 'leafDark' },
      { z: 0.31, body: 'sunYellow', lid: 'brass' },
    ];
    const base = 0.04;
    for (const b of bins) {
      parts.push(
        kit.cylinder(BIN_R, BIN_R, BIN_H, [0, base + BIN_H / 2, b.z], b.body, { segments: 10 }),
        kit.dome(BIN_R + 0.015, [0, base + BIN_H, b.z], b.lid, { segments: 8, scale: [1, 0.45, 1] }),
        // white picture plate on the front
        kit.cylinder(0.075, 0.075, 0.03, [BIN_R, base + 0.3, b.z], 'white', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      );
    }
    // pictures sitting on the plates (x = plate front + a little)
    const px = BIN_R + 0.03;
    // bottle (blue bin)
    parts.push(
      kit.cylinder(0.025, 0.025, 0.07, [px, base + 0.285, -0.31], 'blue', { segments: 8 }),
      kit.cylinder(0.011, 0.018, 0.04, [px, base + 0.34, -0.31], 'blue', { segments: 8 }),
    );
    // leaf (green bin)
    parts.push(kit.sphere(0.04, [px, base + 0.3, 0], 'leafDark', { detail: 0, scale: [0.35, 1, 0.7] }));
    // apple (yellow bin)
    parts.push(
      kit.sphere(0.04, [px, base + 0.29, 0.31], 'red', { detail: 0, scale: [0.5, 1, 1] }),
      kit.box([0.02, 0.03, 0.015], [px, base + 0.345, 0.31], 'woodDark'),
    );
    return kit.finish(parts);
  },
};
