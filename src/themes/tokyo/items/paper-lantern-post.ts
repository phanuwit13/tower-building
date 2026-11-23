import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A wooden post on a stone foot with an arm; a round red paper lantern hangs from the arm and breathes at night.
// No writing on the lantern, only ribs.
const POST_X = -0.18;
const LANTERN = { x: 0.14, y: 0.88, r: 0.24, stretch: 1.15 };

/** โคมไฟกระดาษ: a wooden post with a glowing round paper lantern. */
export const item: ItemModel = {
  id: 'paper-lantern-post',
  name: 'โคมไฟกระดาษ',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const topY = LANTERN.y + LANTERN.r * LANTERN.stretch;
    const parts: Part[] = [
      kit.cylinder(0.3, 0.32, 0.05, [-0.05, 0.025, 0], 'stone', { segments: 10 }),
      kit.cylinder(0.05, 0.06, 1.3, [POST_X, 0.05 + 0.65, 0], 'woodDark', { segments: 8 }),
      kit.box([0.4, 0.05, 0.06], [POST_X + 0.14, 1.3, 0], 'woodDark'),
      kit.cylinder(0.012, 0.012, 1.3 - topY, [LANTERN.x, (1.3 + topY) / 2, 0], 'charcoal', { segments: 4 }),
      // lantern: a stretched ball with dark caps and rib rings, glowing red
      kit.sphere(LANTERN.r, [LANTERN.x, LANTERN.y, 0], 'red', { detail: 2, scale: [1, LANTERN.stretch, 1], glow: true, light: 'breathe' }),
      kit.cylinder(0.1, 0.1, 0.05, [LANTERN.x, topY, 0], 'charcoal', { segments: 8 }),
      kit.cylinder(0.1, 0.1, 0.05, [LANTERN.x, LANTERN.y - LANTERN.r * LANTERN.stretch, 0], 'charcoal', { segments: 8 }),
    ];
    for (const h of [-0.12, 0, 0.12]) {
      const r = LANTERN.r * Math.sqrt(1 - (h / (LANTERN.r * LANTERN.stretch)) ** 2) + 0.012;
      parts.push(kit.torus(r, 0.014, [LANTERN.x, LANTERN.y + h, 0], 'redDark', { radialSegments: 4, tubularSegments: 16, rotate: [Math.PI / 2, 0, 0] }));
    }
    return kit.finish(parts);
  },
};
