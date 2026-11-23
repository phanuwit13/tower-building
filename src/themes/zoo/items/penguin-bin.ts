import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A penguin-shaped bin (1 x 1), facing +x: navy body with a white belly, flippers, orange feet and a
// big open orange beak whose dark gap is the slot for rubbish.
const GROUND_H = 0.03;
const BODY = { r: 0.3, h: 0.7 };
const TOP = GROUND_H + BODY.h; // where the dome head starts

/** ถังขยะรูปเพนกวิน: a penguin-shaped bin with an open beak as the slot. */
export const item: ItemModel = {
  id: 'penguin-bin',
  name: 'ถังขยะรูปเพนกวิน',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.92, GROUND_H, 0.92], [0, GROUND_H / 2, 0], 'glassBlue'), // an icy mat
      kit.cylinder(BODY.r, BODY.r + 0.02, BODY.h, [0, GROUND_H + BODY.h / 2, 0], 'navy', { segments: 12 }),
      kit.dome(BODY.r, [0, TOP, 0], 'navy', { segments: 12, scale: [1, 1.1, 1] }),
      // white belly: a flattened sphere on the front
      kit.sphere(0.28, [0.14, GROUND_H + 0.4, 0], 'white', { scale: [0.55, 1.15, 0.95] }),
      // eyes
      kit.sphere(0.06, [0.22, TOP + 0.1, 0.12], 'white', { detail: 0 }),
      kit.sphere(0.06, [0.22, TOP + 0.1, -0.12], 'white', { detail: 0 }),
      kit.sphere(0.032, [0.265, TOP + 0.1, 0.12], 'charcoal', { detail: 0 }),
      kit.sphere(0.032, [0.265, TOP + 0.1, -0.12], 'charcoal', { detail: 0 }),
      // open beak: upper and lower halves with the dark slot between
      kit.box([0.16, 0.05, 0.2], [0.35, TOP - 0.04, 0], 'orange', { rotate: [0, 0, -0.12] }),
      kit.box([0.12, 0.04, 0.16], [0.34, TOP - 0.17, 0], 'orange', { rotate: [0, 0, 0.1] }),
      kit.box([0.1, 0.1, 0.17], [0.31, TOP - 0.105, 0], 'charcoal'),
    ];
    // flippers, a little out from the body, and feet
    for (const side of [-1, 1]) {
      parts.push(
        kit.sphere(0.1, [0, GROUND_H + 0.45, side * 0.35], 'navy', { scale: [0.55, 1.5, 0.35], rotate: [side * 0.35, 0, 0] }),
        kit.sphere(0.09, [0.28, GROUND_H + 0.025 + 0.02, side * 0.12], 'orange', { scale: [1.5, 0.35, 1], detail: 0 }),
      );
    }
    return kit.finish(parts);
  },
};
