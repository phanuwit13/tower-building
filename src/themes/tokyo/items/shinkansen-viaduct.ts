import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A bullet train (white, blue stripe, long ellipsoid nose at +z) on a raised concrete viaduct along z.
const DECK = { top: 0.67, w: 1.5 };
const TRAIN_Y = 0.93; // body centre
const HALF_H = 0.17;

/** รถไฟชินคันเซ็น: a sleek white bullet train with a blue-striped long nose on a raised viaduct. */
export const item: ItemModel = {
  id: 'shinkansen-viaduct',
  name: 'รถไฟชินคันเซ็น',
  category: 'vehicle',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([DECK.w, 0.14, 2.96], [0, DECK.top - 0.07, 0], 'stone'),
      kit.box([DECK.w - 0.2, 0.05, 2.96], [0, 0.46, 0], 'stoneDark'),
      kit.box([0.06, 0.1, 2.96], [DECK.w / 2 - 0.03, DECK.top + 0.05, 0], 'white'),
      kit.box([0.06, 0.1, 2.96], [-DECK.w / 2 + 0.03, DECK.top + 0.05, 0], 'white'),
      // rails
      kit.box([0.03, 0.03, 2.9], [-0.15, DECK.top + 0.015, 0], 'chrome'),
      kit.box([0.03, 0.03, 2.9], [0.15, DECK.top + 0.015, 0], 'chrome'),
      // blue neon strip along the deck sides
      kit.box([0.02, 0.04, 2.7], [DECK.w / 2 + 0.01, 0.58, 0], 'blue', { glow: 'blue' }),
      kit.box([0.02, 0.04, 2.7], [-DECK.w / 2 - 0.01, 0.58, 0], 'blue', { glow: 'blue' }),
      // train body, stripe and roof
      kit.box([0.46, 2 * HALF_H, 2.0], [0, TRAIN_Y, -0.1], 'white'),
      kit.box([0.48, 0.05, 2.0], [0, TRAIN_Y - 0.05, -0.1], 'blue'),
      kit.box([0.3, 0.03, 1.9], [0, TRAIN_Y + HALF_H + 0.015, -0.1], 'stone'),
      kit.box([0.34, 0.06, 0.24], [0, DECK.top + 0.1, -0.8], 'charcoal'),
      kit.box([0.34, 0.06, 0.24], [0, DECK.top + 0.1, 0.6], 'charcoal'),
      // the long nose and a short tail
      kit.sphere(0.23, [0, TRAIN_Y, 0.9], 'white', { scale: [1, 0.74, 2.5] }),
      kit.sphere(0.235, [0, TRAIN_Y - 0.07, 0.9], 'blue', { scale: [0.98, 0.16, 2.5] }),
      kit.sphere(0.12, [0, TRAIN_Y + 0.05, 1.05], 'navy', { scale: [0.95, 0.5, 1.5] }),
      kit.sphere(0.23, [0, TRAIN_Y, -1.1], 'white', { scale: [1, 0.74, 1.1] }),
      kit.sphere(0.04, [-0.1, TRAIN_Y - 0.1, 1.38], 'lampWarm', { detail: 0, glow: true }),
      kit.sphere(0.04, [0.1, TRAIN_Y - 0.1, 1.38], 'lampWarm', { detail: 0, glow: true }),
    ];
    // lit windows down both sides
    for (let i = 0; i < 7; i++) {
      const z = -0.95 + i * 0.28;
      for (const s of [1, -1]) {
        parts.push(kit.box([0.02, 0.09, 0.16], [s * 0.239, TRAIN_Y + 0.05, z], 'skyBlue', { glow: 'windowWarm', light: 'window' }));
      }
    }
    // pillars and footings
    for (const z of [-1.1, 0, 1.1]) {
      parts.push(kit.box([0.3, 0.52, 0.4], [0, 0.26, z], 'stone'));
      parts.push(kit.box([0.5, 0.04, 0.6], [0, 0.02, z], 'stoneDark'));
    }
    // overhead-wire posts with small lamps
    for (const z of [-1.2, 1.2]) {
      for (const s of [1, -1]) {
        parts.push(kit.box([0.05, 0.4, 0.05], [s * 0.62, DECK.top + 0.2, z], 'charcoal'));
        parts.push(kit.sphere(0.035, [s * 0.62, DECK.top + 0.42, z], 'skyBlue', { detail: 0, glow: true }));
      }
    }
    return kit.finish(parts);
  },
};
