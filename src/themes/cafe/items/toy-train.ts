import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// A low table (1×2, long side along z) with a round track and a little train going round it.
const TABLE_Y = 0.28; // table top
const R = 0.34; // track radius
const TRACK_Y = TABLE_Y + 0.02;
const SPIN: MotionOpts = { kind: 'spin', pivot: [0, TRACK_Y, 0], speed: 0.4 }; // about the track's centre

/** รถไฟของเล่น: a round toy track on a low table, a little train going round. */
export const item: ItemModel = {
  id: 'toy-train',
  name: 'รถไฟของเล่น',
  category: 'play',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.94, 0.06, 1.9], [0, TABLE_Y - 0.03, 0], 'sand')];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      parts.push(kit.box([0.08, TABLE_Y - 0.06, 0.08], [sx * 0.4, (TABLE_Y - 0.06) / 2, sz * 0.88], 'woodDark'));
    }
    // green felt rolling hills with the track on it, all still
    parts.push(
      kit.box([0.9, 0.012, 1.86], [0, TABLE_Y + 0.006, 0], 'lime'),
      kit.torus(R, 0.022, [0, TRACK_Y - 0.002, 0], 'woodDark', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 24 }),
    );
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      parts.push(kit.box([0.025, 0.012, 0.1], [R * Math.cos(a), TABLE_Y + 0.02, -R * Math.sin(a)], 'wood', { rotate: [0, a, 0] }));
    }
    // scenery on the felt: a tunnel, a tree, a little station
    parts.push(
      kit.dome(0.16, [0, TABLE_Y + 0.012, 0.76], 'terracotta', { segments: 8 }),
      kit.dome(0.1, [0, TABLE_Y + 0.012, 0.76], 'bark', { segments: 8 }),
      kit.cylinder(0.025, 0.025, 0.1, [0.3, TABLE_Y + 0.06, -0.72], 'woodDark', { segments: 6 }),
      kit.sphere(0.13, [0.3, TABLE_Y + 0.2, -0.72], 'leaf', { detail: 0 }),
      kit.box([0.22, 0.12, 0.2], [-0.25, TABLE_Y + 0.07, -0.74], 'red'),
      kit.wedge([0.28, 0.08, 0.26], [-0.25, TABLE_Y + 0.16, -0.74], 'sunYellow', { rotate: [0, Math.PI / 2, 0] }),
    );
    // train: engine + two carriages, tangent to the track, all on the one spin pivot
    const car = (a: number, size: [number, number, number], color: 'blue' | 'red' | 'sunYellow' | 'orange') =>
      kit.box(size, [R * Math.cos(a), TRACK_Y + 0.02 + size[1] / 2, -R * Math.sin(a)], color, { rotate: [0, a + Math.PI / 2, 0], motion: SPIN });
    const step = 0.5;
    parts.push(
      car(0, [0.2, 0.09, 0.1], 'blue'),
      car(0.03, [0.08, 0.07, 0.11], 'red'),
      kit.cylinder(0.03, 0.03, 0.08, [R * Math.cos(0.08), TRACK_Y + 0.115, -R * Math.sin(0.08)], 'sunYellow', { segments: 8, motion: SPIN }),
      kit.sphere(0.035, [R * Math.cos(-0.07), TRACK_Y + 0.12, -R * Math.sin(-0.07)], 'lampWarm', { detail: 0, motion: SPIN }),
      car(-step, [0.18, 0.08, 0.1], 'orange'),
      car(-2 * step, [0.18, 0.08, 0.1], 'sunYellow'),
    );
    return kit.finish(parts);
  },
};
