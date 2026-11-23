import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

// A sand disc with a round nest (a sand ring round a dark hollow with eggshells) at the back, and two baby sea
// turtles crawling out towards +x.
const BASE = { r: 0.46, h: 0.03 };
const G = BASE.h;
const NEST = { x: -0.17, z: 0 };

/** A baby turtle on the sand at (x, z), turned by `yaw` about y (0 faces +x). */
function baby(kit: StyleKit, x: number, z: number, yaw: number): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  /** Local (forward, side, up) to world. */
  const at = (f: number, side: number, up: number): [number, number, number] => [x + f * c + side * s, G + up, z - f * s + side * c];
  const rot: [number, number, number] = [0, yaw, 0];
  const flipper = (f: number, side: number): Part => kit.sphere(0.04, at(f, side, 0.02), 'leaf', { detail: 0, scale: [1.5, 0.35, 0.75], rotate: [0, yaw + (side > 0 ? -0.5 : 0.5) * Math.sign(f || 1), 0] });
  return [
    kit.dome(0.1, at(0, 0, 0.01), 'leafDark', { segments: 8, scale: [1.15, 0.85, 1], rotate: rot }), // shell
    kit.sphere(0.045, at(0.14, 0, 0.05), 'leaf', { detail: 0, scale: [1.1, 0.9, 1] }), // head
    kit.sphere(0.012, at(0.17, 0.03, 0.075), 'charcoal', { detail: 0 }),
    kit.sphere(0.012, at(0.17, -0.03, 0.075), 'charcoal', { detail: 0 }),
    flipper(0.07, 0.11),
    flipper(0.07, -0.11),
    flipper(-0.07, 0.1),
    flipper(-0.07, -0.1),
  ];
}

/** ลูกเต่าทะเลกับรัง: a sand nest with two baby sea turtles heading out. */
export const item: ItemModel = {
  id: 'turtle-nest',
  name: 'ลูกเต่าทะเลกับรัง',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(BASE.r, BASE.r, BASE.h, [0, BASE.h / 2, 0], 'sand', { segments: 16 }),
      // nest: a raised sand ring round a dark hollow
      kit.torus(0.17, 0.065, [NEST.x, G + 0.045, NEST.z], 'sand', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.17, 0.17, 0.02, [NEST.x, G + 0.02, NEST.z], 'bark', { segments: 8 }),
      kit.sphere(0.04, [NEST.x - 0.04, G + 0.06, NEST.z + 0.03], 'white', { detail: 0 }), // an egg
      kit.sphere(0.04, [NEST.x + 0.04, G + 0.055, NEST.z - 0.04], 'white', { detail: 0 }), // and a half shell
      kit.sphere(0.04, [NEST.x - 0.02, G + 0.055, NEST.z - 0.07], 'white', { detail: 0, scale: [1, 0.6, 1] }),
      ...baby(kit, 0.12, 0.17, 0.1),
      ...baby(kit, 0.2, -0.2, -0.2),
    ];
    return kit.finish(parts);
  },
};
