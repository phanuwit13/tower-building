import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { glassWindow, rod } from '../../../models/parts';

// A concrete jetty along the -x side (2×3, long side along z); a small white-and-blue ferry rides in the sea beside it.
const WATER: MotionOpts = { kind: 'water', water: 'pond' };
const SEA = { x0: -0.2, x1: 0.98, h: 0.06 }; // water slab from the jetty edge to the +x side
const JETTY = { x0: -0.98, x1: -0.2, d: 2.9, h: 0.16 };
const HULL = { x: 0.5, w: 0.58, d: 2.0, y0: 0.045, h: 0.17 };
const CABIN = { w: 0.46, d: 1.1, h: 0.26, z: -0.12 };

/** ท่าเรือเฟอร์รี่: a concrete jetty with bollards and a small white-and-blue ferry moored beside it. */
export const item: ItemModel = {
  id: 'ferry-dock',
  name: 'ท่าเรือเฟอร์รี่',
  category: 'vehicle',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const jw = JETTY.x1 - JETTY.x0;
    const hullTop = HULL.y0 + HULL.h;
    const cabinTop = hullTop + CABIN.h;
    const parts: Part[] = [
      kit.box([SEA.x1 - SEA.x0, SEA.h, JETTY.d], [(SEA.x0 + SEA.x1) / 2, SEA.h / 2, 0], 'navy', { motion: WATER }),
      // jetty: concrete deck with a pale edge strip and darker piles
      kit.box([jw, JETTY.h, JETTY.d], [(JETTY.x0 + JETTY.x1) / 2, JETTY.h / 2, 0], 'stone'),
      kit.box([0.08, 0.03, JETTY.d * 0.96], [JETTY.x1 - 0.04, JETTY.h + 0.015, 0], 'white'),
      kit.box([0.08, 0.03, JETTY.d * 0.96], [JETTY.x0 + 0.04, JETTY.h + 0.015, 0], 'white'),
      // hull: blue with a white deck line and a pointed bow towards +z
      kit.box([HULL.w, HULL.h, HULL.d], [HULL.x, HULL.y0 + HULL.h / 2, 0], 'blue'),
      kit.box([HULL.w + 0.02, 0.04, HULL.d + 0.02], [HULL.x, hullTop - 0.01, 0], 'white'),
      kit.wedge([HULL.w, 0.4, HULL.h], [HULL.x, HULL.y0 + HULL.h / 2, HULL.d / 2 + 0.2 - 0.01], 'blue', { rotate: [Math.PI / 2, 0, 0] }),
      kit.wedge([HULL.w - 0.06, 0.34, 0.02], [HULL.x, hullTop + 0.011, HULL.d / 2 + 0.17 - 0.01], 'white', { rotate: [Math.PI / 2, 0, 0] }),
      // cabin, roof, funnel
      kit.box([CABIN.w, CABIN.h, CABIN.d], [HULL.x, hullTop + CABIN.h / 2, CABIN.z], 'white'),
      kit.box([CABIN.w + 0.1, 0.05, CABIN.d + 0.1], [HULL.x, cabinTop + 0.025, CABIN.z], 'blue'),
      kit.cylinder(0.07, 0.08, 0.2, [HULL.x, cabinTop + 0.15, CABIN.z - 0.2], 'red', { segments: 8 }),
      kit.cylinder(0.075, 0.075, 0.04, [HULL.x, cabinTop + 0.22, CABIN.z - 0.2], 'charcoal', { segments: 8 }),
      // wheelhouse on top of the cabin front
      kit.box([0.3, 0.14, 0.3], [HULL.x, cabinTop + 0.12, CABIN.z + 0.3], 'white'),
      kit.box([0.36, 0.04, 0.36], [HULL.x, cabinTop + 0.21, CABIN.z + 0.3], 'blue'),
      // bollards on the jetty, ropes to the ferry
      ...[-0.9, 0, 0.9].map((z) => kit.cylinder(0.05, 0.06, 0.1, [JETTY.x1 - 0.14, JETTY.h + 0.05, z], 'charcoal', { segments: 8 })),
      ...[-0.7, 0.7].map((z) => rod(kit, [JETTY.x1 - 0.14, JETTY.h + 0.08, z], [HULL.x - HULL.w / 2 + 0.02, hullTop, z], 0.016, 'stoneDark', { segments: 4 })),
      // life rings on the jetty: a red-and-white pair
      kit.torus(0.08, 0.03, [-0.6, JETTY.h + 0.03 + 0.08 * 0, 1.2], 'red', { rotate: [Math.PI / 2, 0, 0], tubularSegments: 12 }),
      // cargo crates
      kit.box([0.22, 0.2, 0.22], [-0.7, JETTY.h + 0.1, -1.0], 'wood'),
      kit.box([0.2, 0.16, 0.2], [-0.62, JETTY.h + 0.08, -0.72], 'woodDark'),
      kit.box([0.16, 0.14, 0.16], [-0.7, JETTY.h + 0.27, -1.0], 'sunYellow'),
    ];
    // two side windows + front window on the cabin
    for (const z of [-0.4, -0.12, 0.16]) {
      parts.push(...glassWindow(kit, { at: [HULL.x + CABIN.w / 2, hullTop + 0.15, z], facing: 'x+', w: 0.16, h: 0.12, panes: 1 }));
    }
    parts.push(...glassWindow(kit, { at: [HULL.x, cabinTop + 0.12, CABIN.z + 0.45], facing: 'z+', w: 0.2, h: 0.07, panes: 2 }));
    return kit.finish(parts);
  },
};
