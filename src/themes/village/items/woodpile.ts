import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const FLOOR_H = 0.03;
const LOG = { r: 0.12, len: 0.72 }; // logs lie along z, their ends face the camera

/** กองฟืน: a neat stack of firewood (3 + 2 + 1 logs, tallest at the back) with a small high lean-to roof over the back only. */
export const item: ItemModel = {
  id: 'woodpile',
  name: 'กองฟืน',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.96, FLOOR_H, 0.96], [0, FLOOR_H / 2, 0], 'sand')];
    [3, 2, 1].forEach((count, row) => {
      for (let i = 0; i < count; i++) {
        const x = -0.12 + i * LOG.r * 2; // rows start at the back and step down towards +x
        const y = FLOOR_H + LOG.r + row * LOG.r * 1.75;
        const col = (row + i) % 2 === 0 ? 'wood' : 'woodDark';
        parts.push(kit.cylinder(LOG.r, LOG.r, LOG.len, [x, y, 0], col, { segments: 6, rotate: [Math.PI / 2, 0, 0] }));
        for (const sg of [-1, 1]) {
          parts.push(kit.cylinder(LOG.r * 0.8, LOG.r * 0.8, 0.03, [x, y, sg * (LOG.len / 2 + 0.005)], 'sand', { segments: 6, rotate: [Math.PI / 2, 0, 0] }));
        }
      }
    });
    // roof 0.15 clear above the top log (top at 0.72), over the back third only, sloping down towards +x
    for (const sz of [-0.42, 0.42]) {
      parts.push(kit.box([0.06, 0.88, 0.06], [-0.42, FLOOR_H + 0.44, sz], 'woodDark'), kit.box([0.06, 0.8, 0.06], [0.04, FLOOR_H + 0.4, sz], 'woodDark'));
    }
    parts.push(kit.box([0.6, 0.05, 0.96], [-0.19, FLOOR_H + 0.865, 0], 'terracotta', { rotate: [0, 0, -0.15] }));
    return kit.finish(parts);
  },
};
