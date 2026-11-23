import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const BASE = 0.04;
const PAINT_Y = BASE + 0.005; // paint boxes are 0.02 thick: tops at BASE + 0.015
const HOOP_Z = -1.12; // the rim's centre

/** สนามบาสครึ่งสนาม: a half court with a hoop, painted lines (no numbers) and a ball. */
export const item: ItemModel = {
  id: 'basketball-court',
  name: 'สนามบาสครึ่งสนาม',
  category: 'play',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.96, BASE, 2.96], [0, BASE / 2, 0], 'blue'),
      // the key (painted area) under the hoop
      kit.box([0.76, 0.02, 1.1], [0, PAINT_Y, -0.9], 'orange'),
    ];
    // white boundary lines, inset a little from the edge
    const edge = (size: [number, number, number], at: [number, number, number]): void => {
      parts.push(kit.box(size, at, 'white'));
    };
    const LW = 0.04;
    edge([1.8, 0.02, LW], [0, PAINT_Y + 0.005, 1.4]);
    edge([1.8, 0.02, LW], [0, PAINT_Y + 0.005, -1.4]);
    edge([LW, 0.02, 2.84], [0.88, PAINT_Y + 0.005, 0]);
    edge([LW, 0.02, 2.84], [-0.88, PAINT_Y + 0.005, 0]);
    // key outline and free-throw line
    edge([0.8, 0.02, LW], [0, PAINT_Y + 0.005, -0.33]);
    edge([LW, 0.02, 1.07], [0.4, PAINT_Y + 0.005, -0.865]);
    edge([LW, 0.02, 1.07], [-0.4, PAINT_Y + 0.005, -0.865]);
    // free-throw circle (full) and the long arc
    parts.push(
      kit.torus(0.28, 0.02, [0, PAINT_Y + 0.005, -0.33], 'white', { radialSegments: 4, tubularSegments: 16, rotate: [Math.PI / 2, 0, 0] }),
      kit.torus(0.82, 0.02, [0, PAINT_Y + 0.005, HOOP_Z], 'white', {
        radialSegments: 4,
        tubularSegments: 16,
        arc: Math.PI,
        rotate: [Math.PI / 2, 0, 0],
      }),
    );
    // the hoop: a pole behind, an arm, the backboard, a red rim and a net
    parts.push(
      kit.cylinder(0.05, 0.06, 1.55, [0, BASE + 0.775, -1.4], 'charcoal', { segments: 8 }),
      kit.box([0.08, 0.06, 0.2], [0, BASE + 1.4, -1.32], 'charcoal'),
      kit.box([0.62, 0.4, 0.04], [0, BASE + 1.5, -1.22], 'white'),
      kit.box([0.3, 0.2, 0.045], [0, BASE + 1.45, -1.22], 'red'),
      kit.box([0.26, 0.16, 0.05], [0, BASE + 1.45, -1.22], 'white'),
      kit.torus(0.13, 0.02, [0, BASE + 1.3, HOOP_Z], 'orange', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.125, 0.07, 0.2, [0, BASE + 1.2, HOOP_Z], 'white', { segments: 8 }),
    );
    // a ball resting near the free-throw circle
    parts.push(
      kit.sphere(0.1, [0.42, BASE + 0.1, 0.35], 'orange', { detail: 1 }),
      kit.box([0.205, 0.02, 0.02], [0.42, BASE + 0.1, 0.35], 'charcoal'),
    );
    return kit.finish(parts);
  },
};
