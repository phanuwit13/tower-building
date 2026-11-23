import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A small striped rocket on a launch stand (1x2). The stand is a deck on legs, with a little fuel pipe.
const DECK = { w: 0.9, d: 1.8, h: 0.08 };
const R = 0.2;
const B = 0.42; // rocket bottom

export const item: ItemModel = {
  id: 'mini-rocket',
  name: 'จรวดเล็ก',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([DECK.w, DECK.h, DECK.d], [0, DECK.h / 2, 0], 'stone'),
      kit.box([0.5, 0.03, 1.5], [0, DECK.h + 0.015, 0], 'stoneDark'),
      // stand: four short legs under the rocket's fins, a ring at the bottom
      kit.cylinder(0.26, 0.3, 0.1, [0, DECK.h + 0.05, 0], 'charcoal', { segments: 12 }),
      kit.cylinder(0.09, 0.14, 0.2, [0, DECK.h + 0.2, 0], 'stoneDark', { segments: 8 }),
      // body
      kit.cylinder(R, R, 0.4, [0, B + 0.2, 0], 'white'),
      kit.cylinder(R + 0.01, R + 0.01, 0.14, [0, B + 0.47, 0], 'red'),
      kit.cylinder(R, R, 0.3, [0, B + 0.69, 0], 'white'),
      kit.cylinder(R + 0.01, R + 0.01, 0.1, [0, B + 0.89, 0], 'blue'),
      kit.cone(R, 0.5, [0, B + 1.17, 0], 'red'),
      kit.cylinder(0.08, 0.13, 0.12, [0, B - 0.06, 0], 'charcoal', { segments: 8 }),
      kit.sphere(0.07, [R - 0.01, B + 0.69, 0], 'skyBlue', { glow: 'windowWarm', light: 'window', scale: [0.5, 1, 1] }),
      kit.sphere(0.07, [0, B + 0.69, R - 0.01], 'skyBlue', { glow: 'windowWarm', light: 'window', scale: [1, 1, 0.5] }),
      // fins
      kit.wedge([0.26, 0.42, 0.06], [R + 0.13 - 0.02, B + 0.21, 0], 'orange', { apex: -0.5, scale: [-1, 1, 1] }),
      kit.wedge([0.26, 0.42, 0.06], [-R - 0.13 + 0.02, B + 0.21, 0], 'orange', { apex: -0.5 }),
      kit.wedge([0.26, 0.42, 0.06], [0, B + 0.21, R + 0.13 - 0.02], 'orange', { apex: -0.5, rotate: [0, Math.PI / 2, 0] }),
      kit.wedge([0.26, 0.42, 0.06], [0, B + 0.21, -R - 0.13 + 0.02], 'orange', { apex: -0.5, rotate: [0, -Math.PI / 2, 0] }),
      // support tower: two posts and an arm holding the rocket
      kit.box([0.06, 1.3, 0.06], [-0.32, DECK.h + 0.65, -0.1], 'teal'),
      kit.box([0.06, 1.3, 0.06], [-0.32, DECK.h + 0.65, 0.1], 'teal'),
      kit.box([0.12, 0.06, 0.26], [-0.32, DECK.h + 1.28, 0], 'teal'),
      kit.box([0.18, 0.05, 0.1], [-0.21, B + 0.8, 0], 'sunYellow'),
      // fuel pipe along the deck and a small tank
      kit.cylinder(0.05, 0.05, 0.3, [0.1, DECK.h + 0.06, 0.7], 'orange', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.13, 0.13, 0.22, [0.2, DECK.h + 0.14, 0.62], 'sunYellow', { segments: 10 }),
    ];
    return kit.finish(parts);
  },
};
