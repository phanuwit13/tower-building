import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// A long stone trough (along z) with a hand pump at the +z end, spout over the water.
const TROUGH = { w: 0.5, l: 1.4, z: -0.2, h: 0.2, rim: 0.1, wall: 0.06 };
const RIM_TOP = TROUGH.h + TROUGH.rim;
const WATER_TOP = 0.235;
const WATER: MotionOpts = { kind: 'water', water: 'pond' };
const PUMP = { z: 0.74, h: 0.62 };
const SPOUT = { y: 0.52, tipZ: 0.36 };

/** รางน้ำสัตว์: a long stone water trough with a pump. */
export const item: ItemModel = {
  id: 'water-trough',
  name: 'รางน้ำสัตว์',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const iw = TROUGH.w - TROUGH.wall * 2;
    const parts: Part[] = [
      kit.box([TROUGH.w, TROUGH.h, TROUGH.l], [0, TROUGH.h / 2, TROUGH.z], 'stone'),
      kit.box([TROUGH.wall, TROUGH.rim, TROUGH.l], [-(TROUGH.w - TROUGH.wall) / 2, TROUGH.h + TROUGH.rim / 2, TROUGH.z], 'stoneDark'),
      kit.box([TROUGH.wall, TROUGH.rim, TROUGH.l], [(TROUGH.w - TROUGH.wall) / 2, TROUGH.h + TROUGH.rim / 2, TROUGH.z], 'stoneDark'),
      kit.box([iw, TROUGH.rim, TROUGH.wall], [0, TROUGH.h + TROUGH.rim / 2, TROUGH.z - (TROUGH.l - TROUGH.wall) / 2], 'stoneDark'),
      kit.box([iw, TROUGH.rim, TROUGH.wall], [0, TROUGH.h + TROUGH.rim / 2, TROUGH.z + (TROUGH.l - TROUGH.wall) / 2], 'stoneDark'),
      kit.box([iw, 0.03, TROUGH.l - TROUGH.wall * 2], [0, WATER_TOP - 0.015, TROUGH.z], 'navy', { motion: WATER }),
      // stone feet
      kit.box([0.56, 0.04, 0.2], [0, 0.02, TROUGH.z - 0.55], 'stoneDark'),
      kit.box([0.56, 0.04, 0.2], [0, 0.02, TROUGH.z + 0.55], 'stoneDark'),
      // pump: stone block, post, spout, handle, and a thin stream into the trough
      kit.box([0.3, 0.12, 0.3], [0, 0.06, PUMP.z], 'stone'),
      kit.cylinder(0.055, 0.07, PUMP.h - 0.12, [0, 0.12 + (PUMP.h - 0.12) / 2, PUMP.z], 'teal', { segments: 8 }),
      kit.sphere(0.075, [0, PUMP.h + 0.02, PUMP.z], 'teal', { detail: 0 }),
      kit.cylinder(0.03, 0.03, PUMP.z - SPOUT.tipZ, [0, SPOUT.y, (PUMP.z + SPOUT.tipZ) / 2], 'chrome', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.018, 0.018, SPOUT.y - 0.03 - WATER_TOP + 0.02, [0, (SPOUT.y - 0.03 + WATER_TOP - 0.02) / 2, SPOUT.tipZ], 'skyBlue', { segments: 6 }),
      kit.box([0.04, 0.04, 0.3], [0.17, PUMP.h + 0.12, PUMP.z], 'red', { rotate: [0.5, 0, 0] }),
      kit.box([0.14, 0.04, 0.04], [0.09, PUMP.h + 0.07, PUMP.z], 'redDark'),
      // a little grass tuft at the back
      kit.cone(0.05, 0.16, [-0.3, 0.08, TROUGH.z - 0.7], 'leaf', { segments: 5 }),
      kit.cone(0.04, 0.12, [-0.2, 0.06, TROUGH.z - 0.72], 'lime', { segments: 5 }),
    ];
    void RIM_TOP;
    return kit.finish(parts);
  },
};
