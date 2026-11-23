import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// A ring of stones round a small fire (long side along z), with a log seat on each side of it.
// The fire parts glow and breathe at dusk and night, and flicker very gently by day.
const BASE_H = 0.03;
const RING_R = 0.3;
const STONES = 8;
const FLICKER: MotionOpts = { kind: 'sway', pivot: [0, 0.08, 0], amount: 0.12 };

/** กองไฟชายหาด: a ring of stones, a small breathing fire and log seats. */
export const item: ItemModel = {
  id: 'bonfire',
  name: 'กองไฟชายหาด',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.96, BASE_H, 1.96], [0, BASE_H / 2, 0], 'sand'),
      kit.cylinder(0.27, 0.27, 0.02, [0, BASE_H + 0.01, 0], 'charcoal', { segments: 12 }), // burnt ground
      // two crossed logs
      kit.cylinder(0.04, 0.04, 0.4, [0, BASE_H + 0.06, 0], 'bark', { segments: 6, rotate: [0, 0, Math.PI / 2 - 0.2] }),
      kit.cylinder(0.04, 0.04, 0.4, [0, BASE_H + 0.1, 0], 'woodDark', { segments: 6, rotate: [Math.PI / 2 - 0.2, 0, 0] }),
      // fire: red outer, orange middle, yellow core
      kit.cone(0.19, 0.4, [0, BASE_H + 0.31, 0], 'red', { segments: 6, glow: true, light: 'breathe', motion: FLICKER }),
      kit.cone(0.13, 0.34, [0.03, BASE_H + 0.28, 0.02], 'orange', { segments: 6, glow: true, light: 'breathe', motion: FLICKER, rotate: [0, 0.5, 0] }),
      kit.cone(0.07, 0.24, [0, BASE_H + 0.23, -0.02], 'sunYellow', { segments: 6, glow: true, light: 'breathe', motion: FLICKER }),
    ];
    for (let i = 0; i < STONES; i++) {
      const a = (i / STONES) * Math.PI * 2;
      parts.push(kit.sphere(0.075, [RING_R * Math.cos(a), BASE_H + 0.05, RING_R * Math.sin(a)], i % 2 ? 'stoneDark' : 'stone', { detail: 0, scale: [1, 0.8, 1] }));
    }
    // log seats either side of the fire, with pale cut ends
    for (const z of [-0.68, 0.68]) {
      parts.push(
        kit.cylinder(0.11, 0.11, 0.78, [0, BASE_H + 0.11, z], 'wood', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
        kit.cylinder(0.085, 0.085, 0.02, [0.395, BASE_H + 0.11, z], 'sand', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
        kit.cylinder(0.085, 0.085, 0.02, [-0.395, BASE_H + 0.11, z], 'sand', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      );
    }
    return kit.finish(parts);
  },
};
