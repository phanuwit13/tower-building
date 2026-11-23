import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

// A yellow jet ski (bow towards +z) floating in a patch of sea, tied by a rope to a post on a small wooden
// dock at the -z end (long side along z).
const RIM = 0.03;
const WATER_TOP = 0.07;
const SEA: MotionOpts = { kind: 'water', water: 'pond' };
const DOCK = { z0: -0.94, z1: -0.45, h: 0.12 };
const SKI = { z0: -0.2, z1: 0.6, y: WATER_TOP + 0.09 }; // main hull block

/** เจ็ตสกีจอดริมน้ำ: a jet ski moored at the water's edge. */
export const item: ItemModel = {
  id: 'jet-ski',
  name: 'เจ็ตสกีจอดริมน้ำ',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const len = SKI.z1 - SKI.z0;
    const mid = (SKI.z0 + SKI.z1) / 2;
    const parts: Part[] = [
      kit.box([0.96, RIM, 1.96], [0, RIM / 2, 0], 'sand'),
      kit.box([0.88, WATER_TOP - RIM, 0.94 - DOCK.z1], [0, (WATER_TOP + RIM) / 2, (DOCK.z1 + 0.94) / 2], 'navy', { motion: SEA }),
      // wooden dock with a mooring post
      kit.box([0.9, DOCK.h - RIM, DOCK.z1 - DOCK.z0], [0, (DOCK.h + RIM) / 2, (DOCK.z0 + DOCK.z1) / 2], 'wood'),
      kit.cylinder(0.05, 0.05, 0.22, [-0.3, DOCK.h + 0.11, -0.62], 'woodDark', { segments: 6 }),
      kit.sphere(0.06, [-0.3, DOCK.h + 0.23, -0.62], 'woodDark', { detail: 0 }),
      // hull: yellow body, blue stripes, bow wedge, stern
      kit.box([0.42, 0.14, len], [0, SKI.y, mid], 'sunYellow'),
      kit.box([0.43, 0.04, len - 0.05], [0, SKI.y - 0.02, mid], 'blue'),
      kit.wedge([0.42, 0.3, 0.14], [0, SKI.y, SKI.z1 + 0.15], 'sunYellow', { rotate: [Math.PI / 2, 0, 0] }),
      kit.box([0.36, 0.06, 0.16], [0, SKI.y + 0.02, SKI.z0 - 0.06], 'stoneDark'), // jet nozzle
      // engine cover, seat, handlebars, windscreen
      kit.box([0.3, 0.1, 0.3], [0, SKI.y + 0.12, 0.38], 'blue'),
      kit.box([0.22, 0.09, 0.42], [0, SKI.y + 0.11, 0.0], 'charcoal'),
      kit.box([0.04, 0.1, 0.04], [0, SKI.y + 0.22, 0.5], 'chrome'),
      kit.cylinder(0.02, 0.02, 0.3, [0, SKI.y + 0.28, 0.5], 'chrome', { segments: 6, rotate: [Math.PI / 2, 0, Math.PI / 2] }),
      kit.box([0.2, 0.14, 0.02], [0, SKI.y + 0.27, 0.62], 'glassBlue', { rotate: [-0.5, 0, 0] }),
      kit.sphere(0.035, [0.15, SKI.y + 0.28, 0.5], 'red', { detail: 0 }),
      kit.sphere(0.035, [-0.15, SKI.y + 0.28, 0.5], 'red', { detail: 0 }),
      // mooring rope from the post to the stern
      rod(kit, [-0.3, DOCK.h + 0.2, -0.62], [-0.05, SKI.y + 0.05, SKI.z0 - 0.02], 0.02, 'stoneDark', { segments: 4 }),
    ];
    return kit.finish(parts);
  },
};
