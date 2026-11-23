import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A fair-ground stall, counter on the +x side: rows of bottles on a shelf behind the counter, a few
// rings on the bottles and on the counter, a striped awning and a short row of blinking bulbs.
const BASE = { w: 0.92, h: 0.04, d: 1.8 };
const COUNTER = { x: 0.24, w: 0.4, h: 0.4, d: 1.5 };
const SHELF = { x: -0.14, w: 0.34, h: 0.12, d: 1.3 };
const BACK = { x: -0.4, t: 0.06, h: 1.0, d: 1.6 };
const POST_Y = 1.0;
const AWN = { tilt: 0.2, w: 0.78, t: 0.05, y: 1.06 };
const BOTTLE_COLORS: PaletteColor[] = ['leaf', 'sunYellow', 'pink', 'skyBlue'];

/** เกมโยนห่วง: a ring-toss stall with bottles, rings, a striped awning and blinking bulbs. */
export const item: ItemModel = {
  id: 'ring-toss',
  name: 'เกมโยนห่วง',
  category: 'play',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stone'),
      kit.box([BACK.t, BACK.h, BACK.d], [BACK.x, BASE.h + BACK.h / 2, 0], 'blue'),
      kit.box([COUNTER.w, COUNTER.h, COUNTER.d], [COUNTER.x, BASE.h + COUNTER.h / 2, 0], 'wood'),
      kit.box([COUNTER.w + 0.06, 0.04, COUNTER.d + 0.06], [COUNTER.x, BASE.h + COUNTER.h + 0.02, 0], 'red'),
      kit.box([SHELF.w, SHELF.h, SHELF.d], [SHELF.x, BASE.h + COUNTER.h + 0.04 + SHELF.h / 2, 0], 'woodDark'),
    ];
    for (const z of [-0.75, 0.75]) {
      parts.push(
        kit.cylinder(0.035, 0.035, POST_Y, [BACK.x, BASE.h + POST_Y / 2, z], 'white', { segments: 6 }),
        kit.cylinder(0.035, 0.035, POST_Y, [0.4, BASE.h + POST_Y / 2, z], 'white', { segments: 6 }),
      );
    }
    // striped awning, sloping down towards the front
    const stripes = 6;
    const sw = (2 * 0.75 + 0.1) / stripes;
    for (let i = 0; i < stripes; i++) {
      parts.push(kit.box([AWN.w, AWN.t, sw], [0.0, AWN.y + 0.03, -0.8 + sw * (i + 0.5)], i % 2 === 0 ? 'red' : 'white', { rotate: [0, 0, -AWN.tilt] }));
    }
    // bottles: two rows of four on the shelf, rings on some
    const shelfTop = BASE.h + COUNTER.h + 0.04 + SHELF.h;
    const rowsX = [SHELF.x + 0.08, SHELF.x - 0.08];
    rowsX.forEach((x, r) => {
      for (let k = 0; k < 4; k++) {
        const z = -0.45 + k * 0.3 + r * 0.07;
        parts.push(kit.cylinder(0.02, 0.045, 0.16, [x, shelfTop + 0.08, z], BOTTLE_COLORS[(k + r) % 4], { segments: 6 }));
        if ((k + r) % 2 === 0) {
          parts.push(kit.torus(0.05, 0.02, [x, shelfTop + 0.04, z], r === 0 ? 'red' : 'orange', { radialSegments: 4, tubularSegments: 8, rotate: [Math.PI / 2, 0, 0] }));
        }
      }
    });
    // loose rings on the counter, in reach
    parts.push(
      kit.torus(0.06, 0.02, [COUNTER.x + 0.1, BASE.h + COUNTER.h + 0.06, -0.3], 'sunYellow', { radialSegments: 4, tubularSegments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.torus(0.06, 0.02, [COUNTER.x + 0.12, BASE.h + COUNTER.h + 0.06, 0.35], 'pink', { radialSegments: 4, tubularSegments: 8, rotate: [Math.PI / 2, 0, 0] }),
    );
    // blinking bulbs along the awning's front edge
    for (let i = 0; i < 5; i++) {
      parts.push(kit.sphere(0.04, [0.39 * Math.cos(AWN.tilt) + 0.0, AWN.y + 0.03 - 0.39 * Math.sin(AWN.tilt) - 0.05, -0.64 + i * 0.32], 'lampWarm', { detail: 0, glow: true, light: 'blink' }));
    }
    return kit.finish(parts);
  },
};
