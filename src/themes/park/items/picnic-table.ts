import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { ICO_LOW } from '../../../models/parts';

const LENGTH = 1.5; // along z
const TABLE_TOP = 0.5; // shared table height
const SEAT_Y = 0.31; // shared seat height
const TOP_W = 0.5; // table width across x
const BENCH = { x: 0.37, w: 0.2 }; // benches at x = +-BENCH.x

/** โต๊ะปิกนิก: a wooden picnic table with a bench along each side and a basket of fruit. */
export const item: ItemModel = {
  id: 'picnic-table',
  name: 'โต๊ะปิกนิก',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    // three table planks and two bench planks each side
    for (const x of [-0.17, 0, 0.17]) parts.push(kit.box([TOP_W / 3 - 0.01, 0.05, LENGTH], [x, TABLE_TOP - 0.025, 0], 'wood'));
    for (const s of [-1, 1]) parts.push(kit.box([BENCH.w, 0.05, LENGTH - 0.1], [s * BENCH.x, SEAT_Y, 0], 'wood'));
    // two trestles: table legs, bench legs, a low cross rail
    for (const z of [-0.55, 0.55]) {
      for (const s of [-1, 1]) {
        parts.push(
          kit.box([0.06, TABLE_TOP - 0.05, 0.07], [s * 0.17, (TABLE_TOP - 0.05) / 2, z], 'woodDark'),
          kit.box([0.06, SEAT_Y - 0.025, 0.07], [s * BENCH.x, (SEAT_Y - 0.025) / 2, z], 'woodDark'),
        );
      }
      parts.push(kit.box([2 * BENCH.x, 0.05, 0.06], [0, 0.2, z], 'woodDark'));
    }
    // basket with a handle, an apple and an orange on the table
    parts.push(
      kit.box([0.2, 0.1, 0.16], [0.02, TABLE_TOP + 0.05, -0.3], 'terracotta'),
      kit.torus(0.075, 0.016, [0.02, TABLE_TOP + 0.1, -0.3], 'woodDark', { arc: Math.PI, radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0] }),
      kit.sphere(0.045, [0.0, TABLE_TOP + 0.045 * ICO_LOW, 0.25], 'red', { detail: 0 }),
      kit.sphere(0.045, [0.08, TABLE_TOP + 0.045 * ICO_LOW, 0.33], 'orange', { detail: 0 }),
      kit.sphere(0.04, [-0.08, TABLE_TOP + 0.04 * ICO_LOW, 0.34], 'lime', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
