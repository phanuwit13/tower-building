import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// 1x1. A lawn sprinkler. The head, its three arms and the water arcs spin together about the vertical axis.
const BASE = 0.04; // lawn top
const HEAD_Y = 0.11;
const SPIN: MotionOpts = { kind: 'spin', pivot: [0, HEAD_Y, 0], axis: [0, 1, 0], speed: 0.5 };
const ARC_R = 0.16; // water arc radius
const ARC_CX = 0.29; // arc centre, out from the axis
const ARC_Y = 0.065; // where the arc starts and lands (just above the lawn)

/** สปริงเกอร์รดน้ำ: a lawn sprinkler with a spinning head and light-blue water arcs. */
export const item: ItemModel = {
  id: 'sprinkler',
  name: 'สปริงเกอร์รดน้ำ',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.98, BASE, 0.98], [0, BASE / 2, 0], 'lime'),
      kit.cylinder(0.12, 0.14, 0.04, [0, BASE + 0.02, 0], 'stoneDark', { segments: 12 }),
      kit.cylinder(0.07, 0.09, 0.05, [0, BASE + 0.065, 0], 'chrome', { segments: 12 }),
      // spinning part
      kit.cylinder(0.06, 0.06, 0.04, [0, HEAD_Y, 0], 'teal', { segments: 8, motion: SPIN }),
      kit.sphere(0.04, [0, HEAD_Y + 0.04, 0], 'orange', { detail: 0, motion: SPIN }),
    ];
    for (let k = 0; k < 3; k++) {
      const yaw = (k / 3) * Math.PI * 2;
      const c = Math.cos(yaw), s = -Math.sin(yaw);
      parts.push(
        kit.box([0.1, 0.03, 0.035], [c * 0.1, HEAD_Y, s * 0.1], 'teal', { rotate: [0, yaw, 0], motion: SPIN }),
        kit.sphere(0.03, [c * 0.15, HEAD_Y, s * 0.15], 'orange', { detail: 0, motion: SPIN }),
        // the water arc leaves the nozzle and lands on the lawn
        kit.torus(ARC_R, 0.02, [c * ARC_CX, BASE + ARC_Y - 0.02, s * ARC_CX], k === 1 ? 'skyBlue' : 'glassBlue', {
          arc: Math.PI, radialSegments: 4, tubularSegments: 8, rotate: [0, yaw, 0], motion: SPIN,
        }),
        kit.sphere(0.035, [c * (ARC_CX + ARC_R), BASE + 0.02, s * (ARC_CX + ARC_R)], 'skyBlue', { detail: 0, scale: [1.3, 0.4, 1.3], motion: SPIN }),
      );
    }
    return kit.finish(parts);
  },
};
