import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// 2×2. A colourful splash pad: a shallow blue floor, four water-jet posts joined by little water arches, a mushroom shower in the middle.
const FLOOR_TOP = 0.045;
const POOL: MotionOpts = { kind: 'water', water: 'pool' };
const POST_AT = 0.74;
const POST_H = 0.36;
/** Posts: [x, z, colour]. */
const POSTS: Array<[number, number, PaletteColor]> = [[POST_AT, POST_AT, 'red'], [POST_AT, -POST_AT, 'sunYellow'], [-POST_AT, -POST_AT, 'pink'], [-POST_AT, POST_AT, 'purple']];
/** Coloured spots on the floor: [x, z, radius, colour]. */
const SPOTS: Array<[number, number, number, PaletteColor]> = [
  [0.55, 0, 0.2, 'orange'], [-0.55, 0, 0.2, 'orange'], [0, 0.55, 0.2, 'lime'], [0, -0.55, 0.2, 'lime'], [0, 0, 0.42, 'sunYellow'],
];

/** ลานน้ำพุเด็กเล่น: jets, water arches and a mushroom shower on a shallow blue floor. */
export const item: ItemModel = {
  id: 'splash-pad',
  name: 'ลานน้ำพุเด็กเล่น',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.98, 0.03, 1.98], [0, 0.015, 0], 'stone'),
      kit.box([1.84, FLOOR_TOP, 1.84], [0, FLOOR_TOP / 2 + 0.005, 0], 'skyBlue', { motion: POOL }),
    ];
    // painted spots and a low stone kerb round the floor
    for (const [x, z, r, c] of SPOTS) parts.push(kit.cylinder(r, r, 0.012, [x, FLOOR_TOP + 0.011, z], c, { segments: 10 }));
    for (const dz of [-1, 1]) parts.push(kit.box([1.98, 0.08, 0.07], [0, 0.04, dz * 0.955], 'white'));
    for (const dx of [-1, 1]) parts.push(kit.box([0.07, 0.08, 1.84], [dx * 0.955, 0.04, 0], 'white'));
    // water arches along the four sides (flat ellipses between the posts)
    const arch = (cx: number, cz: number, yaw: number): Part =>
      kit.torus(POST_AT, 0.026, [cx, FLOOR_TOP, cz], 'glassBlue', { radialSegments: 4, tubularSegments: 16, arc: Math.PI, rotate: [0, yaw, 0], scale: [1, 0.42, 1] });
    parts.push(arch(POST_AT, 0, Math.PI / 2), arch(-POST_AT, 0, Math.PI / 2), arch(0, POST_AT, 0), arch(0, -POST_AT, 0));
    // jet posts with a spout cap and a pale water ball
    for (const [x, z, c] of POSTS) {
      parts.push(
        kit.cylinder(0.07, 0.09, POST_H, [x, FLOOR_TOP + POST_H / 2, z], c, { segments: 8 }),
        kit.sphere(0.075, [x, FLOOR_TOP + POST_H + 0.04, z], 'glassBlue', { detail: 0 }),
      );
    }
    // mushroom shower: a yellow stem, a red-and-white dome, strands of water falling from its rim
    const stemH = 0.55;
    parts.push(
      kit.cylinder(0.07, 0.1, stemH, [0, FLOOR_TOP + stemH / 2, 0], 'sunYellow', { segments: 8 }),
      kit.dome(0.4, [0, FLOOR_TOP + stemH, 0], 'red', { segments: 12, scale: [1, 0.7, 1] }),
      kit.dome(0.2, [0, FLOOR_TOP + stemH + 0.27, 0], 'white', { segments: 8, scale: [1, 0.45, 1] }),
      kit.sphere(0.05, [0, FLOOR_TOP + stemH + 0.4, 0], 'glassBlue', { detail: 0 }),
    );
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      parts.push(kit.cylinder(0.014, 0.014, 0.5, [0.37 * Math.cos(a), FLOOR_TOP + stemH - 0.24, -0.37 * Math.sin(a)], 'glassBlue', { segments: 4 }));
    }
    return kit.finish(parts);
  },
};
