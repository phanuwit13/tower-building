import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

const LEG = { r: 0.055, h: 0.18 };
const BODY_Y = 0.3;

/** หุ่นยนต์สุนัข: a cute robot dog facing +x, with antenna ears and a blinking nose. */
export const item: ItemModel = {
  id: 'robot-dog',
  name: 'หุ่นยนต์สุนัข',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.sphere(1, [-0.12, BODY_Y, 0], 'white', { detail: 1, scale: [0.3, 0.17, 0.2] }), // body
      kit.box([0.3, 0.05, 0.3], [-0.12, BODY_Y, 0], 'teal'), // teal belt
      kit.box([0.28, 0.1, 0.06], [-0.12, BODY_Y + 0.14, 0], 'orange'), // back stripe
    ];
    // four stubby legs with round feet
    for (const x of [-0.32, 0.07]) {
      for (const z of [-0.14, 0.14]) {
        parts.push(
          kit.cylinder(LEG.r, LEG.r, LEG.h, [x, LEG.h / 2 + 0.07, z], 'orange', { segments: 8 }),
          kit.cylinder(0.075, 0.075, 0.07, [x, 0.035, z], 'charcoal', { segments: 8 }),
        );
      }
    }
    // head: a chunky box with a snout, a glowing blinking nose, eyes and two antenna ears
    const hx = 0.2;
    const hy = 0.46;
    parts.push(
      kit.box([0.26, 0.24, 0.3], [hx, hy, 0], 'white'),
      kit.box([0.12, 0.12, 0.2], [hx + 0.17, hy - 0.04, 0], 'stone'),
      kit.sphere(0.045, [hx + 0.24, hy, 0], 'red', { detail: 0, glow: true, light: 'blink' }), // blinking nose
      kit.sphere(0.04, [hx + 0.1, hy + 0.06, 0.1], 'navy', { detail: 0 }),
      kit.sphere(0.04, [hx + 0.1, hy + 0.06, -0.1], 'navy', { detail: 0 }),
      kit.box([0.04, 0.04, 0.04], [hx + 0.12, hy + 0.08, 0.1], 'white'),
    );
    for (const s of [-1, 1]) {
      const base: [number, number, number] = [hx - 0.04, hy + 0.12, s * 0.1];
      const tip: [number, number, number] = [hx - 0.08, hy + 0.34, s * 0.17];
      parts.push(rod(kit, base, tip, 0.017, 'stoneDark', { segments: 4 }), kit.sphere(0.045, tip, 'sunYellow', { detail: 0 }));
    }
    // tail: a short antenna with a teal ball
    parts.push(rod(kit, [-0.36, BODY_Y + 0.05, 0], [-0.42, BODY_Y + 0.2, 0], 0.02, 'stoneDark', { segments: 4 }), kit.sphere(0.05, [-0.42, BODY_Y + 0.22, 0], 'teal', { detail: 0 }));
    return kit.finish(parts);
  },
};
