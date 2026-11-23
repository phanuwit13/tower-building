import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A round flower backdrop in a green ring, with a pink-cushioned bench in front, on a small deck.
const DECK = 0.04;
const DISC = { x: -0.8, r: 0.8, cy: 0.87 }; // disc centre height: its ring just touches the ground
const FLOWERS = ['pink', 'white', 'sunYellow', 'purple', 'orange'] as const;

/** มุมถ่ายรูปกำแพงดอกไม้: a free-standing flower wall arch with a bench in front. */
export const item: ItemModel = {
  id: 'flower-wall',
  name: 'มุมถ่ายรูปกำแพงดอกไม้',
  category: 'decoration',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.9, DECK, 1.9], [0, DECK / 2, 0], 'sand'),
      kit.cylinder(DISC.r, DISC.r, 0.1, [DISC.x, DISC.cy, 0], 'leaf', { segments: 16, rotate: [0, 0, Math.PI / 2] }),
      kit.torus(DISC.r + 0.02, 0.05, [DISC.x + 0.02, DISC.cy, 0], 'leafDark', { radialSegments: 4, tubularSegments: 16, rotate: [0, Math.PI / 2, 0] }),
      // stand legs behind the disc
      kit.box([0.6, 0.06, 0.1], [DISC.x + 0.1, DECK + 0.03, 0], 'woodDark'),
    ];
    // flowers in rings on the +x face
    const rings: [number, number][] = [[0, 1], [0.22, 6], [0.44, 10], [0.64, 14]];
    let n = 0;
    for (const [radius, count] of rings) {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + radius * 3;
        const y = DISC.cy + radius * Math.sin(a);
        const z = radius * Math.cos(a);
        parts.push(kit.sphere(0.085, [DISC.x + 0.07, y, z], FLOWERS[n % FLOWERS.length], { detail: 0, scale: [0.6, 1, 1] }));
        if (n % 3 === 0) parts.push(kit.sphere(0.04, [DISC.x + 0.1, y, z], 'sunYellow', { detail: 0 }));
        n++;
      }
    }
    // a few leaves between the rings
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.3;
      parts.push(kit.sphere(0.06, [DISC.x + 0.07, DISC.cy + 0.54 * Math.sin(a), 0.54 * Math.cos(a)], 'lime', { detail: 0, scale: [0.5, 1, 1] }));
    }
    // bench facing the wall (-x), backrest toward the camera
    parts.push(
      kit.box([0.42, 0.06, 1.1], [0.4, 0.28, 0], 'wood'),
      kit.box([0.06, 0.3, 1.1], [0.6, 0.46, 0], 'woodDark'),
      kit.box([0.36, 0.05, 0.7], [0.38, 0.335, 0], 'pink'),
      kit.box([0.04, 0.2, 0.6], [0.55, 0.44, 0], 'pink'),
    );
    for (const z of [-0.45, 0.45]) {
      parts.push(kit.box([0.06, 0.25, 0.06], [0.22, DECK + 0.125, z], 'charcoal'), kit.box([0.06, 0.25, 0.06], [0.58, DECK + 0.125, z], 'charcoal'));
    }
    return kit.finish(parts);
  },
};
