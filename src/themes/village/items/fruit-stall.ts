import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

// A wooden stand with a tilted display of fruit that reads from above: mangoes, bananas,
// watermelons and rambutans, with a small tarp over the back. Still.
const STAND = { x: -0.05, w: 0.7, d: 1.7, h: 0.62 };

function mango(kit: StyleKit, x: number, y: number, z: number, c: 'sunYellow' | 'orange' | 'lime'): Part {
  return kit.sphere(0.075, [x, y + 0.06, z], c, { detail: 0, scale: [1, 0.8, 0.9] });
}

/** แผงผลไม้: a wooden stand of mangoes, bananas, watermelons and rambutans. */
export const item: ItemModel = {
  id: 'fruit-stall',
  name: 'แผงผลไม้',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const top = STAND.h;
    const parts: Part[] = [
      kit.box([STAND.w, top - 0.04, STAND.d], [STAND.x, (top - 0.04) / 2, 0], 'wood'),
      kit.box([STAND.w + 0.06, 0.04, STAND.d + 0.06], [STAND.x, top - 0.02, 0], 'woodDark'),
      // low front lip so the fruit does not roll off
      kit.box([0.04, 0.06, STAND.d], [STAND.x + STAND.w / 2 + 0.01, top + 0.03, 0], 'woodDark'),
    ];
    // small tarp over the back half only, so the fruit stays visible from above
    for (const z of [-0.85, 0.85]) parts.push(kit.cylinder(0.03, 0.03, 1.5, [-0.4, 0.75, z], 'woodDark', { segments: 6 }));
    for (let i = 0; i < 6; i++) {
      parts.push(kit.box([0.34, 0.04, 0.3], [-0.3, 1.5, -0.75 + 0.3 * i], i % 2 === 0 ? 'orange' : 'white', { rotate: [0, 0, -0.18] }));
    }
    // back row: three watermelons and a cut one
    for (const [z, c] of [[-0.58, 0.115], [-0.22, 0.12], [0.14, 0.11]] as const) {
      parts.push(kit.sphere(c, [-0.2, top + c * 0.9, z], 'leafDark', { detail: 0, scale: [1, 0.9, 1.15] }));
      parts.push(kit.box([0.04, 0.02, 0.1], [-0.2, top + c * 1.75, z], 'lime'));
    }
    parts.push(kit.dome(0.11, [-0.2, top, 0.52], 'red', { segments: 8, scale: [1, 0.9, 1.3] }));
    // front row: mango heaps (yellow, orange, green) and a banana bunch
    for (const [z, c] of [[-0.62, 'sunYellow'], [-0.4, 'orange']] as const) {
      for (const [dx, dz] of [[-0.07, -0.05], [0.07, -0.05], [0, 0.07]]) parts.push(mango(kit, 0.12 + dx, top, z + dz, c));
      parts.push(mango(kit, 0.12, top + 0.08, z, c));
    }
    for (const [dx, dz] of [[-0.07, -0.05], [0.07, -0.05], [0, 0.07]]) parts.push(mango(kit, 0.12 + dx, top, -0.12 + dz, 'lime'));
    for (let i = 0; i < 4; i++) {
      parts.push(kit.box([0.26, 0.05, 0.05], [0.12, top + 0.05 + (i % 2) * 0.04, 0.22 + i * 0.055], 'sunYellow', { rotate: [0, (i - 1.5) * 0.12, 0.08] }));
      parts.push(kit.box([0.04, 0.05, 0.05], [0.26, top + 0.06 + (i % 2) * 0.04, 0.22 + i * 0.055], 'bark'));
    }
    // rambutans in a basket: red balls with lime tips
    parts.push(kit.cylinder(0.14, 0.11, 0.06, [0.12, top + 0.03, 0.62], 'sand', { segments: 8 }));
    for (const [dx, dz] of [[-0.06, -0.05], [0.06, -0.05], [0, 0.07], [0, 0], [-0.07, 0.06], [0.07, 0.06]]) {
      parts.push(kit.sphere(0.06, [0.12 + dx, top + 0.1, 0.62 + dz], 'red', { detail: 0 }));
      parts.push(kit.sphere(0.02, [0.12 + dx, top + 0.15, 0.62 + dz], 'lime', { detail: 0 }));
    }
    return kit.finish(parts);
  },
};
