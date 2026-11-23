import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const FLOOR_H = 0.03;
const LOG = { r: 0.12, len: 0.72 }; // logs lie along z

/** กองฟืน: a neat stack of firewood (3 + 2 + 1 logs) under a little lean-to roof. */
export const item: ItemModel = {
  id: 'woodpile',
  name: 'กองฟืน',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.96, FLOOR_H, 0.96], [0, FLOOR_H / 2, 0], 'sand')];
    const rows = [3, 2, 1];
    rows.forEach((count, row) => {
      for (let i = 0; i < count; i++) {
        const x = 0.05 + (i - (count - 1) / 2) * LOG.r * 2;
        const y = FLOOR_H + LOG.r + row * LOG.r * 1.75;
        const col = (row + i) % 2 === 0 ? 'wood' : 'woodDark';
        parts.push(kit.cylinder(LOG.r, LOG.r, LOG.len, [x, y, 0], col, { segments: 6, rotate: [Math.PI / 2, 0, 0] }));
        for (const sg of [-1, 1]) {
          parts.push(kit.cylinder(LOG.r * 0.8, LOG.r * 0.8, 0.03, [x, y, sg * (LOG.len / 2 + 0.005)], 'sand', { segments: 6, rotate: [Math.PI / 2, 0, 0] }));
        }
      }
    });
    // lean-to: two tall posts at the back, two short at the front, a sloping roof
    for (const sz of [-0.42, 0.42]) {
      parts.push(kit.box([0.06, 0.66, 0.06], [-0.4, FLOOR_H + 0.33, sz], 'woodDark'), kit.box([0.06, 0.5, 0.06], [0.4, FLOOR_H + 0.25, sz], 'woodDark'));
    }
    parts.push(
      kit.box([0.98, 0.05, 0.96], [0, FLOOR_H + 0.64, 0], 'terracotta', { rotate: [0, 0, -0.2] }),
      kit.box([0.04, 0.05, 0.96], [0.43, FLOOR_H + 0.6, 0], 'redDark'),
    );
    return kit.finish(parts);
  },
};
