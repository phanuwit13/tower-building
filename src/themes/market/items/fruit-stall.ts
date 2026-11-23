import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A wooden counter heaped with fruit under a striped canvas roof; a big hanging bulb and a row of
// small bulbs along the front edge breathe at night.
const TABLE = { w: 0.62, h: 0.32, d: 1.7 };
const POST = { x: 0.42, z: 0.85, h: 1.4 };
const ROOF_Y = 1.38;
const BULBS = ['red', 'sunYellow', 'lime'] as const;
const BREATHE = { glow: true, light: 'breathe' } as const;
const FRUITS = ['red', 'orange', 'pink', 'sunYellow', 'lime'] as const;

/** แผงผลไม้: a fruit stall with a canvas roof and a hanging bulb. */
export const item: ItemModel = {
  id: 'fruit-stall',
  name: 'แผงผลไม้',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([TABLE.w, TABLE.h, TABLE.d], [0, TABLE.h / 2, 0], 'wood'),
      kit.box([TABLE.w - 0.04, 0.06, TABLE.d - 0.06], [0, TABLE.h + 0.03, 0], 'woodDark'),
      kit.box([0.04, 0.12, TABLE.d], [TABLE.w / 2 + 0.03, TABLE.h + 0.06, 0], 'wood'),
    ];
    for (const x of [-POST.x, POST.x]) {
      for (const z of [-POST.z, POST.z]) {
        parts.push(kit.cylinder(0.03, 0.03, POST.h, [x, POST.h / 2, z], 'woodDark', { segments: 6 }));
      }
    }
    // heaps of fruit: three balls and one on top
    const BASE_Y = TABLE.h + 0.06;
    FRUITS.forEach((color, i) => {
      const z = -0.68 + 0.34 * i;
      const r = 0.09;
      for (const [dx, dz] of [[-0.09, -0.06], [0.09, -0.06], [0, 0.09]]) {
        parts.push(kit.sphere(r, [dx, BASE_Y + r * 0.85, z + dz], color, { detail: 0 }));
      }
      parts.push(kit.sphere(r, [0, BASE_Y + r * 0.85 + 0.12, z], color, { detail: 0 }));
    });
    // canvas roof: stripes sloping down towards +x
    for (let i = 0; i < 8; i++) {
      parts.push(kit.box([0.98, 0.04, 0.2], [0, ROOF_Y, -0.8 + 0.2 * i + 0.1], i % 2 === 0 ? 'orange' : 'white', { rotate: [0, 0, -0.2] }));
    }
    // hanging bulb and a string of small ones
    parts.push(
      kit.cylinder(0.02, 0.02, 0.16, [0.1, ROOF_Y - 0.1, 0], 'charcoal', { segments: 4 }),
      kit.sphere(0.09, [0.1, ROOF_Y - 0.26, 0], 'lampWarm', { ...BREATHE }),
    );
    for (let i = 0; i < 9; i++) {
      parts.push(kit.sphere(0.055, [0.45, ROOF_Y - 0.17, -0.8 + 0.2 * i], BULBS[i % 3], { detail: 0, ...BREATHE }));
    }
    // neon apple on a dark board above the roof
    parts.push(
      kit.cylinder(0.025, 0.025, 0.3, [0.1, ROOF_Y + 0.2, -0.3], 'woodDark', { segments: 6 }),
      kit.cylinder(0.025, 0.025, 0.3, [0.1, ROOF_Y + 0.2, 0.3], 'woodDark', { segments: 6 }),
      kit.box([0.05, 0.46, 0.9], [0.1, ROOF_Y + 0.37, 0], 'navy'),
      kit.torus(0.14, 0.04, [0.14, ROOF_Y + 0.35, 0], 'red', { radialSegments: 4, tubularSegments: 12, rotate: [0, Math.PI / 2, 0], glow: 'red' }),
      kit.box([0.05, 0.1, 0.05], [0.14, ROOF_Y + 0.57, 0.02], 'lime', { rotate: [0.5, 0, 0], glow: 'lime' }),
      kit.box([0.05, 0.05, 0.14], [0.14, ROOF_Y + 0.55, 0.12], 'lime', { glow: 'lime' }),
    );
    return kit.finish(parts);
  },
};
