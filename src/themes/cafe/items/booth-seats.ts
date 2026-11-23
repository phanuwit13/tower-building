import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Two booth benches facing each other along z (2×3), a table between them with cups and a cake, and a
// leafy planter at the +x end as a divider.
const BENCH = { w: 1.6, d: 0.55, z: 0.96, seatY: 0.31, backTop: 0.8 };
const TABLE = { w: 1.4, d: 0.8, y: 0.5 };

function bench(kit: StyleKit, side: 1 | -1, cushion: PaletteColor): Part[] {
  const zc = side * BENCH.z;
  const backZ = side * (BENCH.z + BENCH.d / 2 + 0.06);
  return [
    kit.box([BENCH.w, 0.2, BENCH.d], [0, 0.1, zc], 'woodDark'),
    kit.box([BENCH.w - 0.04, 0.11, BENCH.d - 0.03], [0, 0.255, zc], cushion),
    // padded back, taller than a chair, with a darker rail on top
    kit.box([BENCH.w, BENCH.backTop - 0.2, 0.12], [0, (BENCH.backTop + 0.2) / 2, backZ], 'woodDark'),
    kit.box([BENCH.w - 0.1, BENCH.backTop - 0.34, 0.06], [0, (BENCH.backTop + 0.36) / 2, backZ - side * 0.07], cushion),
    kit.box([BENCH.w + 0.04, 0.05, 0.16], [0, BENCH.backTop + 0.025, backZ], 'wood'),
  ];
}

/** ที่นั่งบูธ: two booth benches facing each other, a table and a plant divider. */
export const item: ItemModel = {
  id: 'booth-seats',
  name: 'ที่นั่งบูธ',
  category: 'seating',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      ...bench(kit, 1, 'teal'),
      ...bench(kit, -1, 'orange'),
      // table: pedestal, base plate, cream top with a red runner
      kit.cylinder(0.08, 0.08, TABLE.y - 0.05, [-0.05, (TABLE.y - 0.05) / 2, 0], 'charcoal', { segments: 8 }),
      kit.cylinder(0.22, 0.22, 0.04, [-0.05, 0.02, 0], 'charcoal', { segments: 10 }),
      kit.box([TABLE.w, 0.05, TABLE.d], [-0.05, TABLE.y - 0.025, 0], 'cream'),
      kit.box([TABLE.w, 0.012, 0.2], [-0.05, TABLE.y + 0.006, 0], 'red'),
      // two cups on saucers, a plate with a cake slice and a little flower vase
      kit.cylinder(0.09, 0.09, 0.015, [-0.5, TABLE.y + 0.02, 0.2], 'white', { segments: 8 }),
      kit.cylinder(0.055, 0.045, 0.06, [-0.5, TABLE.y + 0.05, 0.2], 'white', { segments: 8 }),
      kit.cylinder(0.045, 0.045, 0.01, [-0.5, TABLE.y + 0.085, 0.2], 'bark', { segments: 8 }),
      kit.cylinder(0.09, 0.09, 0.015, [-0.4, TABLE.y + 0.02, -0.24], 'white', { segments: 8 }),
      kit.cylinder(0.055, 0.045, 0.06, [-0.4, TABLE.y + 0.05, -0.24], 'mint', { segments: 8 }),
      kit.cylinder(0.045, 0.045, 0.01, [-0.4, TABLE.y + 0.085, -0.24], 'bark', { segments: 8 }),
      kit.cylinder(0.12, 0.12, 0.015, [0.35, TABLE.y + 0.02, -0.2], 'white', { segments: 10 }),
      kit.box([0.14, 0.06, 0.11], [0.35, TABLE.y + 0.06, -0.2], 'cream'),
      kit.box([0.145, 0.025, 0.115], [0.35, TABLE.y + 0.1, -0.2], 'pink'),
      kit.sphere(0.025, [0.35, TABLE.y + 0.13, -0.2], 'red', { detail: 0 }),
      kit.cylinder(0.04, 0.035, 0.08, [0.4, TABLE.y + 0.04, 0.22], 'skyBlue', { segments: 8 }),
      kit.sphere(0.04, [0.4, TABLE.y + 0.11, 0.22], 'sunYellow', { detail: 0 }),
      kit.sphere(0.03, [0.37, TABLE.y + 0.105, 0.27], 'pink', { detail: 0 }),
      // plant divider at the +x end: a terracotta planter with a leafy bush
      kit.box([0.16, 0.4, 0.5], [0.9, 0.2, 0], 'terracotta'),
      kit.box([0.17, 0.04, 0.52], [0.9, 0.41, 0], 'woodDark'),
      kit.sphere(0.12, [0.88, 0.58, 0.12], 'leaf', { detail: 0 }),
      kit.sphere(0.11, [0.88, 0.64, -0.12], 'leafDark', { detail: 0 }),
      kit.sphere(0.09, [0.88, 0.76, 0.0], 'lime', { detail: 0 }),
      kit.sphere(0.04, [0.92, 0.7, 0.14], 'pink', { detail: 0 }),
    ];
    return kit.finish(parts);
  },
};
