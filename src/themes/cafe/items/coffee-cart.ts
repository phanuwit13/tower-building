import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// An indoor wooden coffee cart: two big wheels, a handle at the back, a small espresso machine and cups on
// the counter and a red-and-white striped canopy held by two back posts, sloping down to the front (+x).
const R = 0.17; // wheel radius
const BODY = { w: 0.7, h: 0.42, d: 1.2, y: 0.2 };
const COUNTER_Y = BODY.y + BODY.h; // 0.62
const CANOPY = { x0: -0.46, x1: 0.34, y: 1.3, tilt: 0.12, z0: -0.88, stripe: 0.2, n: 8 };

/** รถเข็นกาแฟ: a wooden cart with a small espresso machine and a striped canopy. */
export const item: ItemModel = {
  id: 'coffee-cart',
  name: 'รถเข็นกาแฟ',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BODY.w, BODY.h, BODY.d], [0, BODY.y + BODY.h / 2, 0], 'wood'),
      kit.box([BODY.w + 0.06, 0.04, BODY.d + 0.06], [0, COUNTER_Y - 0.02, 0], 'woodDark'),
      kit.box([0.02, 0.26, 0.9], [BODY.w / 2 + 0.01, 0.4, 0], 'teal'), // front panel
      kit.cylinder(0.06, 0.06, 0.02, [BODY.w / 2 + 0.03, 0.4, 0], 'white', { segments: 10, rotate: [0, 0, Math.PI / 2] }), // cup picture
      kit.cylinder(0.045, 0.045, 0.01, [BODY.w / 2 + 0.04, 0.4, 0], 'bark', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      // handle at the back
      kit.box([0.04, 0.04, 0.3], [-0.2, 0.6, -0.78], 'woodDark'),
      kit.box([0.04, 0.04, 0.3], [0.2, 0.6, -0.78], 'woodDark'),
      kit.box([0.44, 0.04, 0.04], [0, 0.6, -0.94], 'woodDark'),
    ];
    // wheels (axis along x) at the sides, hubs out a little
    for (const x of [-0.39, 0.39]) {
      parts.push(
        kit.cylinder(R, R, 0.06, [x, R, 0.2], 'charcoal', { segments: 12, rotate: [0, 0, Math.PI / 2] }),
        kit.cylinder(0.05, 0.05, 0.08, [x * 1.04, R, 0.2], 'stone', { segments: 6, rotate: [0, 0, Math.PI / 2] }),
      );
    }
    // small front prop wheel-less foot at the back
    parts.push(kit.box([0.5, 0.06, 0.08], [0, 0.17, -0.45], 'woodDark'));

    // espresso machine on the counter, cups and a milk jug on the front edge
    const my = COUNTER_Y;
    parts.push(
      kit.box([0.3, 0.26, 0.36], [-0.12, my + 0.13, -0.3], 'charcoal'),
      kit.box([0.33, 0.03, 0.39], [-0.12, my + 0.275, -0.3], 'chrome'),
      kit.box([0.03, 0.06, 0.3], [0.04, my + 0.17, -0.3], 'red'),
      kit.cylinder(0.035, 0.035, 0.05, [0.04, my + 0.07, -0.38], 'chrome', { segments: 8 }),
      kit.cylinder(0.04, 0.035, 0.06, [0.05, my + 0.03, -0.38], 'white', { segments: 8 }),
      kit.cylinder(0.04, 0.035, 0.06, [0.2, my + 0.03, 0.1], 'sunYellow', { segments: 8 }),
      kit.cylinder(0.04, 0.035, 0.06, [0.2, my + 0.03, 0.3], 'pink', { segments: 8 }),
      kit.cylinder(0.045, 0.055, 0.1, [-0.15, my + 0.05, 0.2], 'chrome', { segments: 8 }),
      kit.cylinder(0.07, 0.07, 0.03, [-0.05, my + 0.015, 0.45], 'white', { segments: 10 }),
      kit.sphere(0.04, [-0.05, my + 0.06, 0.45], 'orange', { detail: 0 }),
    );

    // canopy: two back posts, then alternating red/white stripes sloping down to the front
    for (const z of [-0.6, 0.6]) {
      parts.push(kit.cylinder(0.025, 0.025, CANOPY.y - COUNTER_Y - 0.01, [-0.4, (CANOPY.y + COUNTER_Y) / 2, z], 'woodDark', { segments: 6 }));
    }
    const slope = (CANOPY.x1 - CANOPY.x0) / 2;
    const len = Math.hypot(CANOPY.x1 - CANOPY.x0, 0) / Math.cos(CANOPY.tilt);
    const cx = (CANOPY.x0 + CANOPY.x1) / 2;
    for (let i = 0; i < CANOPY.n; i++) {
      const z = CANOPY.z0 + CANOPY.stripe * (i + 0.5);
      parts.push(kit.box([len, 0.035, CANOPY.stripe], [cx, CANOPY.y, z], i % 2 === 0 ? 'red' : 'white', { rotate: [0, 0, -CANOPY.tilt] }));
      // valance flap on the front edge
      parts.push(kit.box([0.03, 0.09, CANOPY.stripe], [CANOPY.x1 - 0.005, CANOPY.y - slope * Math.tan(CANOPY.tilt) - 0.05, z], i % 2 === 0 ? 'red' : 'white'));
    }
    return kit.finish(parts);
  },
};
