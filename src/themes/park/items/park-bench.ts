import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const SEAT_Y = 0.31; // shared seat height
const Z0 = -0.12; // bench centre along z; the lamp stands past its +z end
const LENGTH = 1.25;
const LAMP = { x: -0.15, z: 0.75, h: 0.8 };
const BREATHE_OFF = { glow: true } as const;

/** ม้านั่งสวน: a classic park bench with wooden slats, scrolled iron arms and a small lamp beside it. */
export const item: ItemModel = {
  id: 'park-bench',
  name: 'ม้านั่งสวน',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const x of [-0.09, 0.04, 0.17]) parts.push(kit.box([0.11, 0.05, LENGTH], [x, SEAT_Y, Z0], 'wood'));
    // backrest: three slats leaning back
    for (const [x, y] of [[-0.2, 0.46], [-0.225, 0.55], [-0.25, 0.64]]) {
      parts.push(kit.box([0.04, 0.07, LENGTH], [x, y, Z0], 'wood', { rotate: [0, 0, 0.18] }));
    }
    // two cast-iron ends: legs, curly arm, scroll under the arm
    for (const z of [Z0 - LENGTH / 2 + 0.07, Z0 + LENGTH / 2 - 0.07]) {
      parts.push(
        kit.box([0.06, 0.29, 0.06], [0.21, 0.145, z], 'charcoal'),
        kit.box([0.06, 0.7, 0.06], [-0.2, 0.35, z], 'charcoal'),
        kit.box([0.46, 0.04, 0.06], [0, 0.265, z], 'charcoal'),
        kit.box([0.04, 0.2, 0.06], [0.2, 0.4, z], 'charcoal'),
        kit.box([0.34, 0.045, 0.08], [0.06, 0.52, z], 'charcoal'),
        kit.sphere(0.04, [0.24, 0.52, z], 'brass', { detail: 0 }),
        kit.torus(0.075, 0.02, [0.06, 0.4, z], 'charcoal', { radialSegments: 4, tubularSegments: 8 }),
      );
    }
    // a little lamp post beside the bench
    parts.push(
      kit.cylinder(0.08, 0.1, 0.06, [LAMP.x, 0.03, LAMP.z], 'charcoal', { segments: 8 }),
      kit.cylinder(0.025, 0.035, LAMP.h - 0.2, [LAMP.x, 0.06 + (LAMP.h - 0.2) / 2, LAMP.z], 'charcoal', { segments: 8 }),
      kit.cylinder(0.09, 0.05, 0.06, [LAMP.x, LAMP.h - 0.17, LAMP.z], 'charcoal', { segments: 8 }),
      kit.sphere(0.09, [LAMP.x, LAMP.h - 0.05, LAMP.z], 'lampWarm', BREATHE_OFF),
      kit.cone(0.1, 0.07, [LAMP.x, LAMP.h + 0.07, LAMP.z], 'charcoal', { segments: 8 }),
    );
    return kit.finish(parts);
  },
};
