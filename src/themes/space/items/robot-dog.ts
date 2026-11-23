import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

const BODY_Y = 0.3;

/** หุ่นยนต์สุนัข: a cute robot dog facing +x: orange body, blue head with antenna ears, a glowing blinking nose. */
export const item: ItemModel = {
  id: 'robot-dog',
  name: 'หุ่นยนต์สุนัข',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.5, 0.22, 0.28], [-0.1, BODY_Y, 0], 'orange'), // body
      kit.box([0.3, 0.04, 0.3], [-0.1, BODY_Y + 0.12, 0], 'sunYellow'), // yellow saddle band
      kit.box([0.08, 0.24, 0.3], [-0.1, BODY_Y, 0], 'white'), // white belt
    ];
    // four legs with dark feet
    for (const x of [-0.27, 0.08]) {
      for (const z of [-0.12, 0.12]) {
        parts.push(
          kit.cylinder(0.05, 0.05, 0.14, [x, 0.14, z], 'white', { segments: 8 }),
          kit.cylinder(0.07, 0.07, 0.07, [x, 0.035, z], 'charcoal', { segments: 8 }),
        );
      }
    }
    // head: a chunky blue box on a neck, a stone snout with a glowing blinking nose, eyes
    const hx = 0.22;
    const hy = 0.5;
    parts.push(
      kit.box([0.1, 0.16, 0.18], [0.12, 0.42, 0], 'white'), // neck
      kit.box([0.26, 0.24, 0.32], [hx, hy, 0], 'blue'),
      kit.box([0.12, 0.12, 0.2], [hx + 0.17, hy - 0.05, 0], 'white'),
      kit.sphere(0.045, [hx + 0.24, hy - 0.01, 0], 'red', { detail: 0, glow: true, light: 'blink' }),
      kit.sphere(0.04, [hx + 0.12, hy + 0.05, 0.1], 'sunYellow', { detail: 0 }),
      kit.sphere(0.04, [hx + 0.12, hy + 0.05, -0.1], 'sunYellow', { detail: 0 }),
    );
    for (const s of [-1, 1]) {
      const base: [number, number, number] = [hx - 0.04, hy + 0.12, s * 0.1];
      const tip: [number, number, number] = [hx - 0.08, hy + 0.34, s * 0.17];
      parts.push(rod(kit, base, tip, 0.02, 'stoneDark', { segments: 4 }), kit.sphere(0.05, tip, 'sunYellow', { detail: 0 }));
    }
    // tail: a short bent antenna with a teal ball
    parts.push(rod(kit, [-0.34, BODY_Y + 0.05, 0], [-0.42, BODY_Y + 0.22, 0], 0.022, 'stoneDark', { segments: 4 }), kit.sphere(0.05, [-0.42, BODY_Y + 0.25, 0], 'teal', { detail: 0 }));
    return kit.finish(parts);
  },
};
