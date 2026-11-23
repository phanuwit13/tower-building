import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { door, glassWindow, wallPanel } from '../../../models/parts';

// 2x2. A little cream café at the back (-x) under one big leaf for a roof; two patio tables with
// striped umbrellas and stools in front (+x), and a coffee cup on the leaf.
const GROUND_H = 0.02;
const PATIO_H = 0.03;
const CAFE = { x: -0.45, w: 0.8, d: 1.3, wallH: 0.52 };
const FRONT_X = CAFE.x + CAFE.w / 2;
const WALL_TOP = GROUND_H + CAFE.wallH;
const LEAF = { x: -0.42, y: WALL_TOP + 0.06, rx: 0.55, ry: 0.1, rz: 0.95, tilt: 0.1 };
/** [x, z] of the two patio tables. */
const TABLES: Array<[number, number]> = [[0.55, -0.5], [0.55, 0.5]];

/** ร้านอาหารสวนสัตว์: cafe with a leaf roof and umbrella tables. */
export const item: ItemModel = {
  id: 'zoo-cafe',
  name: 'ร้านอาหารสวนสัตว์',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.9, GROUND_H, 1.9], [0, GROUND_H / 2, 0], 'lime'),
      kit.box([0.85, PATIO_H, 1.9], [0.5, PATIO_H / 2, 0], 'sand'),
      kit.box([CAFE.w, CAFE.wallH, CAFE.d], [CAFE.x, GROUND_H + CAFE.wallH / 2, 0], 'cream'),
      kit.box([CAFE.w + 0.04, 0.05, CAFE.d + 0.04], [CAFE.x, GROUND_H + 0.025, 0], 'terracotta'), // plinth
      ...door(kit, { at: [FRONT_X, GROUND_H + 0.22, 0.4], facing: 'x+', w: 0.28, h: 0.44, color: 'woodDark', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [FRONT_X, 0.32, -0.15], facing: 'x+', w: 0.5, h: 0.26, panes: 3, frame: 'white' }),
      ...glassWindow(kit, { at: [CAFE.x, 0.32, CAFE.d / 2], facing: 'z+', w: 0.4, h: 0.26, frame: 'white' }),
      ...glassWindow(kit, { at: [CAFE.x, 0.32, -CAFE.d / 2], facing: 'z-', w: 0.4, h: 0.26, frame: 'white' }),
      ...glassWindow(kit, { at: [CAFE.x - CAFE.w / 2, 0.32, 0], facing: 'x-', w: 0.6, h: 0.26, panes: 3, frame: 'white' }),
      ...wallPanel(kit, { at: [FRONT_X, 0.46, 0.4], facing: 'x+', w: 0.34, h: 0.05, depth: 0.02, color: 'sunYellow' }), // lintel over the door
    ];
    // the leaf roof: a flat green ellipsoid, a darker midrib and veins, tipped a little towards +x
    const tilt = LEAF.tilt;
    parts.push(
      kit.sphere(1, [LEAF.x, LEAF.y, 0], 'leaf', { scale: [LEAF.rx, LEAF.ry, LEAF.rz], rotate: [0, 0, -tilt] }),
      kit.box([0.04, 0.02, 1.7], [LEAF.x, LEAF.y + LEAF.ry - 0.005, 0], 'leafDark', { rotate: [0, 0, -tilt] }), // midrib
    );
    for (const z of [-0.55, -0.25, 0.05, 0.35, 0.65]) {
      for (const side of [-1, 1]) {
        const bw = 0.58 * Math.sqrt(Math.max(0.05, 1 - (z / LEAF.rz) ** 2) * 0.8);
        parts.push(kit.box([bw, 0.016, 0.03], [LEAF.x + side * bw * 0.45, LEAF.y + LEAF.ry * 0.88 - Math.abs(side * bw * 0.45) * Math.sin(tilt) * 0 - side * bw * 0.45 * Math.sin(tilt), z + 0.12], 'leafDark', { rotate: [0, side * 0.5, -tilt] }));
      }
    }
    // coffee cup on the leaf
    const cup: Vec3 = [LEAF.x - 0.02, LEAF.y + LEAF.ry + 0.07, 0.4];
    parts.push(
      kit.cylinder(0.11, 0.075, 0.14, cup, 'white', { segments: 10 }),
      kit.cylinder(0.095, 0.095, 0.02, [cup[0], cup[1] + 0.065, cup[2]], 'bark', { segments: 10 }),
      kit.torus(0.05, 0.016, [cup[0], cup[1] + 0.01, cup[2] + 0.12], 'white', { arc: Math.PI, rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 8 }),
    );
    // patio tables with umbrellas
    for (const [x, z] of TABLES) {
      const top = PATIO_H + 0.3;
      parts.push(
        kit.cylinder(0.025, 0.025, 0.3, [x, PATIO_H + 0.15, z], 'stoneDark', { segments: 6 }),
        kit.cylinder(0.16, 0.16, 0.03, [x, top, z], 'wood', { segments: 10 }),
        kit.cylinder(0.014, 0.014, 0.42, [x, top + 0.21, z], 'white', { segments: 6 }), // umbrella pole
        kit.cone(0.3, 0.14, [x, top + 0.49, z], 'red', { segments: 6 }),
        kit.cone(0.3, 0.14, [x, top + 0.49, z], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0], scale: [1.002, 1.002, 1.002] }),
        kit.cylinder(0.035, 0.035, 0.04, [x + 0.05, top + 0.035, z + 0.03], 'terracotta', { segments: 8 }), // a cup
      );
      for (const [sx, sz] of [[0.26, 0.04], [-0.04, -0.25]] as const) {
        parts.push(kit.cylinder(0.07, 0.06, 0.2, [x + sx, PATIO_H + 0.1, z + sz], 'orange', { segments: 8 }));
      }
    }
    return kit.finish(parts);
  },
};
