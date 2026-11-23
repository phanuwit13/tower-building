import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A narrow high table (top 0.70) with a tall stool at each end (seat 0.50), long side along z.
const TABLE_Y = 0.7;
const STOOL_Y = 0.5;

function stool(kit: StyleKit, z: number, color: PaletteColor): Part[] {
  const parts: Part[] = [
    kit.cylinder(0.17, 0.17, 0.06, [0, STOOL_Y - 0.03, z], color, { segments: 10 }),
    kit.torus(0.13, 0.015, [0, 0.2, z], 'chrome', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
  ];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      parts.push(kit.box([0.04, STOOL_Y - 0.06, 0.04], [sx * 0.11, (STOOL_Y - 0.06) / 2, z + sz * 0.11], 'charcoal'));
    }
  }
  return parts;
}

/** โต๊ะสูงกับเก้าอี้บาร์: a high narrow table with two tall stools. */
export const item: ItemModel = {
  id: 'high-table-stools',
  name: 'โต๊ะสูงกับเก้าอี้บาร์',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit: StyleKit) => {
    const parts: Part[] = [
      // table: base disc, post, wide top with a yellow edge stripe
      kit.cylinder(0.22, 0.22, 0.04, [0, 0.02, 0], 'charcoal', { segments: 10 }),
      kit.cylinder(0.05, 0.05, TABLE_Y - 0.05, [0, (TABLE_Y - 0.05) / 2, 0], 'chrome', { segments: 8 }),
      kit.box([0.6, 0.05, 1.0], [0, TABLE_Y - 0.025, 0], 'wood'),
      kit.box([0.62, 0.03, 0.12], [0, TABLE_Y - 0.03, 0.46], 'sunYellow'),
      kit.box([0.62, 0.03, 0.12], [0, TABLE_Y - 0.03, -0.46], 'sunYellow'),
      // cups, a saucer plate with a cookie, and a small flower
      kit.cylinder(0.09, 0.09, 0.015, [0.1, TABLE_Y + 0.008, 0.28], 'white', { segments: 8 }),
      kit.cylinder(0.055, 0.045, 0.07, [0.1, TABLE_Y + 0.05, 0.28], 'pink', { segments: 8 }),
      kit.cylinder(0.045, 0.045, 0.01, [0.1, TABLE_Y + 0.085, 0.28], 'bark', { segments: 8 }),
      kit.cylinder(0.055, 0.045, 0.07, [-0.1, TABLE_Y + 0.035, -0.3], 'mint', { segments: 8 }),
      kit.cylinder(0.045, 0.045, 0.01, [-0.1, TABLE_Y + 0.072, -0.3], 'bark', { segments: 8 }),
      kit.cylinder(0.1, 0.1, 0.015, [0.05, TABLE_Y + 0.008, 0.0], 'white', { segments: 10 }),
      kit.cylinder(0.06, 0.06, 0.02, [0.05, TABLE_Y + 0.025, 0.0], 'sand', { segments: 8 }),
      kit.cylinder(0.03, 0.03, 0.08, [-0.18, TABLE_Y + 0.04, 0.12], 'skyBlue', { segments: 6 }),
      kit.sphere(0.04, [-0.18, TABLE_Y + 0.11, 0.12], 'pink', { detail: 0 }),
    ];
    parts.push(...stool(kit, 0.74, 'red'), ...stool(kit, -0.74, 'teal'));
    return kit.finish(parts);
  },
};
