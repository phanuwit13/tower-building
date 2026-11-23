import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A red-roofed stall; the counter holds an iron plate with 3 x 6 dimples, each holding a golden ball.
// Lanterns glow steadily (no animation on this stall); a neon octopus (purple) sits on the roof.
const TOP = 0.62;
const COLS = [-0.02, 0.12, 0.26]; // x of the three rows of balls
const ROWS = 6; // balls along z
const STEP = 0.15;

/** ร้านทาโกะยากิ: a stall with a round-dimpled grill full of takoyaki balls. */
export const item: ItemModel = {
  id: 'takoyaki-stall',
  name: 'ร้านทาโกะยากิ',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.7, TOP - 0.04, 1.6], [0.1, (TOP - 0.04) / 2, 0], 'wood'),
      kit.box([0.08, 0.12, 1.4], [0.45, 0.3, 0], 'woodDark'),
      kit.box([0.78, 0.04, 1.7], [0.1, TOP - 0.02, 0], 'woodDark'),
      kit.box([0.06, 0.62, 1.7], [-0.3, TOP + 0.31, 0], 'red'),
      kit.box([0.52, 0.04, 1.08], [0.13, TOP + 0.02, 0], 'stoneDark'),
    ];
    // roof: red and white strips sloping down towards the front
    const SLOPE = -0.2;
    for (let i = 0; i < 6; i++) {
      const z = -0.75 + i * 0.3;
      parts.push(kit.box([0.78, 0.04, 0.3], [0.04, 1.28, z], i % 2 ? 'white' : 'red', { rotate: [0, 0, SLOPE] }));
    }
    for (const z of [-0.8, 0.8]) parts.push(kit.cylinder(0.025, 0.025, 0.6, [0.42, TOP + 0.3, z], 'woodDark', { segments: 6 }));
    // the grill
    for (const x of COLS) {
      for (let i = 0; i < ROWS; i++) {
        const z = (i - (ROWS - 1) / 2) * STEP;
        parts.push(kit.cylinder(0.062, 0.062, 0.012, [x, TOP + 0.046, z], 'charcoal', { segments: 6 }));
        parts.push(kit.sphere(0.058, [x, TOP + 0.085, z], 'sunYellow', { detail: 0 }));      }
    }
    // steady glowing lanterns under the front eave
    for (const z of [-0.5, 0.5]) {
      parts.push(
        kit.cylinder(0.012, 0.012, 0.1, [0.38, 1.13, z], 'charcoal', { segments: 4 }),
        kit.sphere(0.1, [0.38, 0.98, z], 'orange', { detail: 0, scale: [1, 1.15, 1], glow: true }),
      );
    }
    // neon octopus on the roof: purple head, four short legs
    parts.push(kit.sphere(0.13, [0, 1.46, 0], 'purple', { detail: 1, glow: true, scale: [1, 0.9, 1] }));
    for (const dz of [-0.09, -0.03, 0.03, 0.09]) {
      parts.push(kit.cylinder(0.022, 0.012, 0.13, [0.1, 1.34, dz * 1.3], 'purple', { segments: 6, glow: true, rotate: [0, 0, -0.5] }));
    }
    parts.push(kit.sphere(0.025, [0.12, 1.5, -0.05], 'white', { detail: 0 }), kit.sphere(0.025, [0.12, 1.5, 0.05], 'white', { detail: 0 }));
    return kit.finish(parts);
  },
};
