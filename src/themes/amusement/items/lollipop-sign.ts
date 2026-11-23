import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A giant lollipop: a round foot, a white stick, a pink disc (facing +x and -x) with a white and purple swirl
// made of ring arcs, and a red bow under the disc.
const FOOT = { r: 0.32, h: 0.06 };
const STICK = { r: 0.04, top: 1.3 };
const DISC = { r: 0.42, t: 0.1, y: 1.32 };
/** Swirl arcs: ring radius, start angle, colour. Each arc is three quarters of a circle. */
const SWIRL: Array<[number, number, PaletteColor]> = [[0.31, 0, 'white'], [0.2, 2.1, 'purple'], [0.1, 4.2, 'white']];

/** ป้ายอมยิ้มยักษ์: a giant swirly lollipop on a stick. */
export const item: ItemModel = {
  id: 'lollipop-sign',
  name: 'ป้ายอมยิ้มยักษ์',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(FOOT.r, FOOT.r + 0.03, FOOT.h, [0, FOOT.h / 2, 0], 'stone', { segments: 12 }),
      kit.cylinder(STICK.r, STICK.r, STICK.top - FOOT.h, [0, (FOOT.h + STICK.top) / 2, 0], 'white', { segments: 8 }),
      kit.cylinder(DISC.r, DISC.r, DISC.t, [0, DISC.y, 0], 'pink', { segments: 16, rotate: [0, 0, Math.PI / 2] }),
      kit.torus(DISC.r, 0.035, [0, DISC.y, 0], 'purple', { rotate: [0, Math.PI / 2, 0], radialSegments: 4, tubularSegments: 16 }),
      // bow under the disc
      kit.sphere(0.05, [0, 0.8, 0], 'red', { detail: 0 }),
      kit.cone(0.08, 0.16, [0, 0.8, 0.1], 'red', { segments: 6, rotate: [-Math.PI / 2, 0, 0] }),
      kit.cone(0.08, 0.16, [0, 0.8, -0.1], 'red', { segments: 6, rotate: [Math.PI / 2, 0, 0] }),
    ];
    for (const s of [1, -1]) {
      const x = s * (DISC.t / 2 + 0.005);
      parts.push(kit.sphere(0.06, [x, DISC.y, 0], 'white', { detail: 0 }));
      for (const [r, start, color] of SWIRL) {
        parts.push(kit.torus(r, 0.035, [x, DISC.y, 0], color, {
          arc: Math.PI * 1.5, rotate: [0, s * (Math.PI / 2), s * start], radialSegments: 4, tubularSegments: 12,
        }));
      }
    }
    return kit.finish(parts);
  },
};
