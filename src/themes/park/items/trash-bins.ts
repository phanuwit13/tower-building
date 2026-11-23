import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const BIN_H = 0.5;
const BIN_R = 0.15;
const BASE = 0.04;
const LID_H = 0.05;
const TOP = BASE + BIN_H + LID_H; // top of the lid
const PLATE_Y = TOP + 0.006; // white picture plate on the lid (0.012 thick)
const ICON_Y = PLATE_Y + 0.006; // icons lie on the plate

/** ถังขยะแยกประเภท: three coloured bins in a row; each lid carries a big picture (bottle, paper, leaf). */
export const item: ItemModel = {
  id: 'trash-bins',
  name: 'ถังขยะแยกประเภท',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.5, BASE, 0.96], [0, BASE / 2, 0], 'stone')];
    const bins: { z: number; body: PaletteColor; lid: PaletteColor }[] = [
      { z: -0.31, body: 'blue', lid: 'navy' },
      { z: 0, body: 'sunYellow', lid: 'brass' },
      { z: 0.31, body: 'leaf', lid: 'leafDark' },
    ];
    for (const b of bins) {
      parts.push(
        kit.cylinder(BIN_R, BIN_R, BIN_H, [0, BASE + BIN_H / 2, b.z], b.body, { segments: 10 }),
        kit.cylinder(BIN_R, BIN_R, LID_H, [0, BASE + BIN_H + LID_H / 2, b.z], b.lid, { segments: 10 }),
        kit.cylinder(0.125, 0.125, 0.012, [0, PLATE_Y, b.z], 'white', { segments: 10 }),
      );
    }
    // bottle lying on the plate, neck towards +x (blue bin)
    const z0 = -0.31;
    parts.push(
      kit.cylinder(0.035, 0.035, 0.11, [-0.015, ICON_Y + 0.035, z0], 'blue', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.016, 0.03, 0.05, [0.065, ICON_Y + 0.016, z0], 'blue', { segments: 8, rotate: [0, 0, -Math.PI / 2] }),
      kit.box([0.012, 0.014, 0.034], [0.1, ICON_Y + 0.012, z0], 'orange'),
    );
    // sheet of paper with lines (yellow bin)
    const z1 = 0;
    parts.push(kit.box([0.15, 0.012, 0.12], [0, ICON_Y + 0.006, z1], 'skyBlue'));
    for (const x of [-0.04, 0, 0.04]) parts.push(kit.box([0.014, 0.014, 0.09], [x, ICON_Y + 0.012, z1], 'navy'));
    // leaf (green bin) with a stem
    const z2 = 0.31;
    parts.push(
      kit.sphere(0.075, [0, ICON_Y + 0.012, z2], 'leafDark', { detail: 1, scale: [1.05, 0.16, 0.65], rotate: [0, 0.6, 0] }),
      kit.box([0.1, 0.012, 0.018], [-0.075, ICON_Y + 0.02, z2 + 0.045], 'bark', { rotate: [0, 0.6, 0] }),
    );
    return kit.finish(parts);
  },
};
