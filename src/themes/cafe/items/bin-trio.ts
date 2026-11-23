import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Three sorting bins in a row along z with coloured lids and a picture on each lid: a bottle on
// blue, a sheet of paper on yellow, a leaf on green. No text.
const BIN_H = 0.5;
const LID_Y = BIN_H + 0.03;

function bin(kit: StyleKit, z: number, lid: PaletteColor, band: PaletteColor): Part[] {
  return [
    kit.cylinder(0.2, 0.17, BIN_H, [0, BIN_H / 2, z], 'charcoal', { segments: 10 }),
    kit.cylinder(0.205, 0.195, 0.1, [0, 0.34, z], band, { segments: 10 }),
    kit.cylinder(0.225, 0.225, 0.06, [0, LID_Y, z], lid, { segments: 10 }),
    kit.box([0.06, 0.05, 0.04], [0.22, LID_Y - 0.01, z], 'charcoal'),
  ];
}

/** ถังขยะแยกประเภท: three bins with blue, yellow and green lids and picture icons. */
export const item: ItemModel = {
  id: 'bin-trio',
  name: 'ถังขยะแยกประเภท',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit: StyleKit) => {
    const top = LID_Y + 0.03;
    const parts: Part[] = [
      ...bin(kit, -0.62, 'blue', 'blue'),
      ...bin(kit, 0, 'sunYellow', 'sunYellow'),
      ...bin(kit, 0.62, 'leaf', 'leaf'),
      // bottle icon on the blue lid, lying along x: body, neck and a yellow cap
      kit.box([0.12, 0.015, 0.08], [-0.04, top + 0.0075, -0.62], 'white'),
      kit.box([0.07, 0.015, 0.04], [0.055, top + 0.0075, -0.62], 'white'),
      kit.box([0.03, 0.02, 0.05], [0.105, top + 0.01, -0.62], 'sunYellow'),
      // paper icon on the yellow lid: a sheet with a folded corner and two colour bars
      kit.box([0.17, 0.015, 0.14], [0, top + 0.0075, 0], 'white'),
      kit.box([0.04, 0.02, 0.04], [0.065, top + 0.01, 0.05], 'stoneDark'),
      kit.box([0.03, 0.02, 0.1], [-0.04, top + 0.01, 0], 'skyBlue'),
      // leaf icon on the green lid: a pale leaf with a darker stem
      kit.sphere(0.08, [0, top + 0.01, 0.62], 'white', { detail: 0, scale: [1.3, 0.2, 0.75], rotate: [0, 0.6, 0] }),
      kit.box([0.1, 0.02, 0.02], [-0.1, top + 0.012, 0.67], 'leafDark', { rotate: [0, 0.6, 0] }),
    ];
    return kit.finish(parts);
  },
};
