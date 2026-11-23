import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A friendly grey water buffalo facing +x: barrel body, hump, big head with a pale muzzle and two crescent horns.
const BODY = { x: -0.1, y: 0.31, rx: 0.3, ry: 0.22, rz: 0.24 };
const HEAD = { x: 0.31, y: 0.38 };
const LEG_X = [0.08, -0.3];
const LEG_Z = 0.13;
const HORN = { r: 0.1, tube: 0.028 };

/** ควาย: a friendly grey water buffalo with curved horns. */
export const item: ItemModel = {
  id: 'water-buffalo',
  name: 'ควาย',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.sphere(1, [BODY.x, BODY.y, 0], 'stoneDark', { detail: 1, scale: [BODY.rx * 1.25, BODY.ry, BODY.rz] }),
      kit.sphere(0.15, [0.0, 0.42, 0], 'stoneDark', { detail: 1, scale: [1, 0.8, 1] }), // shoulder hump
      kit.sphere(0.16, [0.2, 0.4, 0], 'stoneDark', { detail: 1 }), // neck
      kit.sphere(0.13, [HEAD.x, HEAD.y, 0], 'stoneDark', { detail: 1, scale: [1.15, 0.95, 1.0] }),
      kit.sphere(0.075, [0.4, 0.33, 0], 'stone', { detail: 1, scale: [1, 0.85, 1.1] }), // pale muzzle
      kit.box([0.02, 0.02, 0.025], [0.46, 0.34, 0.03], 'charcoal'),
      kit.box([0.02, 0.02, 0.025], [0.46, 0.34, -0.03], 'charcoal'),
      // tail with a tuft
      kit.cylinder(0.015, 0.02, 0.26, [-0.42, 0.33, 0], 'stoneDark', { segments: 6, rotate: [0, 0, 0.25] }),
      kit.sphere(0.04, [-0.45, 0.18, 0], 'charcoal', { detail: 0 }),
    ];
    for (const sz of [1, -1]) {
      // eyes, ears, horns (a half ring laid flat, tilted up and out)
      parts.push(
        kit.sphere(0.022, [HEAD.x + 0.1, HEAD.y + 0.04, sz * 0.085], 'charcoal', { detail: 0 }),
        kit.sphere(0.06, [HEAD.x - 0.04, HEAD.y + 0.02, sz * 0.15], 'stone', { detail: 0, scale: [1, 0.5, 1] }),
        kit.torus(HORN.r, HORN.tube, [HEAD.x - 0.11, HEAD.y + 0.1, sz * 0.09], 'cream',
          { arc: Math.PI, radialSegments: 5, tubularSegments: 8, rotate: [sz * (Math.PI / 2 - 0.5), 0, 0] }),
      );
    }
    for (const x of LEG_X) for (const z of [LEG_Z, -LEG_Z]) {
      parts.push(
        kit.cylinder(0.055, 0.05, 0.2, [x, 0.12, z], 'stoneDark', { segments: 8 }),
        kit.cylinder(0.058, 0.058, 0.04, [x, 0.02, z], 'charcoal', { segments: 8 }),
      );
    }
    return kit.finish(parts);
  },
};
