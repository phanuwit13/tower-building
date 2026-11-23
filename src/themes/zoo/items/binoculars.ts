import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A coin-operated viewing binocular on a post. The big lenses look towards +x (the viewer stands behind, at -x).
const BASE = { r: 0.3, h: 0.06 };
const POST_TOP = 0.86;
const HEAD_Y = 0.95;
const BARREL = { len: 0.42, rFront: 0.1, rBack: 0.075, gap: 0.115, x: 0.02 };
const LEFT = -Math.PI / 2; // a cylinder turned so its +y (the wide end) points along +x

/** กล้องส่องทางไกล: coin-operated viewing binoculars on a stand. */
export const item: ItemModel = {
  id: 'binoculars',
  name: 'กล้องส่องทางไกล',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(BASE.r, BASE.r, BASE.h, [0, BASE.h / 2, 0], 'stone', { segments: 16 }),
      kit.cylinder(0.05, 0.065, POST_TOP - BASE.h, [0, (POST_TOP + BASE.h) / 2, 0], 'blue', { segments: 8 }),
      kit.sphere(0.075, [0, POST_TOP, 0], 'navy', { detail: 0 }),
      // coin box on the post, with a slot and a round knob
      kit.box([0.16, 0.2, 0.12], [0.07, 0.5, 0], 'sunYellow'),
      kit.box([0.01, 0.07, 0.025], [0.155, 0.54, 0], 'charcoal'),
      kit.cylinder(0.035, 0.035, 0.02, [0.16, 0.45, 0], 'brass', { segments: 8, rotate: [0, 0, LEFT] }),
      // the binocular head: two tapered barrels, front lenses, eyepieces and a bridge
      kit.box([0.2, 0.05, 2 * BARREL.gap], [BARREL.x, HEAD_Y, 0], 'navy'),
    ];
    for (const sz of [-1, 1]) {
      const z = sz * BARREL.gap;
      parts.push(
        kit.cylinder(BARREL.rFront, BARREL.rBack, BARREL.len, [BARREL.x, HEAD_Y + 0.02, z], 'blue', { segments: 12, rotate: [0, 0, LEFT] }),
        kit.cylinder(BARREL.rFront - 0.012, BARREL.rFront - 0.012, 0.03, [BARREL.x + BARREL.len / 2 + 0.005, HEAD_Y + 0.02, z], 'skyBlue', { segments: 12, rotate: [0, 0, LEFT] }),
        kit.cylinder(BARREL.rFront + 0.012, BARREL.rFront + 0.012, 0.03, [BARREL.x + BARREL.len / 2 - 0.03, HEAD_Y + 0.02, z], 'navy', { segments: 12, rotate: [0, 0, LEFT] }),
        kit.cylinder(0.06, 0.06, 0.08, [BARREL.x - BARREL.len / 2 - 0.03, HEAD_Y + 0.02, z], 'charcoal', { segments: 8, rotate: [0, 0, LEFT] }),
      );
    }
    return kit.finish(parts);
  },
};
