import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { ICO_LOW } from '../../../models/parts';

// A red-and-white striped lighthouse (2×3) on a heap of rocks. The lamp is a glowing drum that breathes at night.
const TOWER_X = -0.05;
const TOWER_Z = 0;
const SEGMENTS = 12;
/** Tower bands bottom to top: [colour, height, radius at the bottom, radius at the top]. */
const BANDS: Array<['red' | 'white', number, number, number]> = [
  ['white', 0.5, 0.5, 0.45], ['red', 0.4, 0.45, 0.41], ['white', 0.4, 0.41, 0.37], ['red', 0.4, 0.37, 0.33],
];
const BASE_Y = 0.18; // the rocks' top: the tower stands on a flat stone footing
const LAMP = { r: 0.2, h: 0.3 };
/** Rocks round the foot: [x, z, radius, squash]. Spans x ±0.9 and z ±1.4 so the heap fills the footprint. */
const ROCKS: Array<[number, number, number, number]> = [
  [0.55, 0.9, 0.36, 0.7], [-0.4, 1.05, 0.34, 0.8], [0.3, -1.05, 0.34, 0.75], [-0.5, -0.95, 0.4, 0.8],
  [0.62, -0.2, 0.3, 0.8], [-0.6, 0.2, 0.32, 0.7], [0.1, 1.05, 0.3, 0.7], [-0.1, -1.1, 0.28, 0.9],
];

/** ประภาคาร: a striped lighthouse on rocks. */
export const item: ItemModel = {
  id: 'lighthouse',
  name: 'ประภาคาร',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [];
    // rocks: lowest point exactly on the ground
    ROCKS.forEach(([x, z, r, sq], i) => {
      parts.push(kit.sphere(r, [x, r * sq * ICO_LOW, z], i % 3 === 0 ? 'stone' : 'stoneDark', { detail: 0, scale: [1.15, sq, 1.0] }));
    });
    // a flat stone footing on top of the heap, with a sandy skirt
    parts.push(kit.cylinder(0.78, 0.86, 0.2, [TOWER_X, 0.1, TOWER_Z], 'stone', { segments: SEGMENTS }));
    parts.push(kit.cylinder(0.62, 0.7, 0.06, [TOWER_X, 0.2 + 0.03 - 0.0, TOWER_Z], 'stoneDark', { segments: SEGMENTS }));
    let y = BASE_Y + 0.06;
    for (const [color, h, rb, rt] of BANDS) {
      parts.push(kit.cylinder(rt, rb, h, [TOWER_X, y + h / 2, TOWER_Z], color, { segments: SEGMENTS }));
      y += h;
    }
    // door on the +x side
    parts.push(kit.box([0.04, 0.26, 0.17], [TOWER_X + 0.49, BASE_Y + 0.06 + 0.13, 0], 'woodDark'));
    // gallery: a wide ring with a rail
    parts.push(kit.cylinder(0.46, 0.4, 0.06, [TOWER_X, y + 0.03, TOWER_Z], 'charcoal', { segments: SEGMENTS }));
    y += 0.06;
    parts.push(kit.torus(0.43, 0.018, [TOWER_X, y + 0.14, TOWER_Z], 'white', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 16 }));
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      parts.push(kit.cylinder(0.014, 0.014, 0.14, [TOWER_X + Math.cos(a) * 0.43, y + 0.07, TOWER_Z + Math.sin(a) * 0.43], 'white', { segments: 4 }));
    }
    // lamp room: glowing drum held by four white posts, red cap with a ball on top
    parts.push(kit.cylinder(LAMP.r, LAMP.r, LAMP.h, [TOWER_X, y + LAMP.h / 2, TOWER_Z], 'lampWarm', { segments: 8, glow: true, light: 'breathe' }));
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + (k / 4) * Math.PI * 2;
      parts.push(kit.box([0.05, LAMP.h + 0.02, 0.05], [TOWER_X + Math.cos(a) * (LAMP.r + 0.005), y + LAMP.h / 2, TOWER_Z + Math.sin(a) * (LAMP.r + 0.005)], 'white'));
    }
    y += LAMP.h;
    parts.push(kit.cylinder(0.27, 0.27, 0.04, [TOWER_X, y + 0.02, TOWER_Z], 'redDark', { segments: SEGMENTS }));
    parts.push(kit.cone(0.26, 0.26, [TOWER_X, y + 0.04 + 0.13, TOWER_Z], 'red', { segments: SEGMENTS }));
    parts.push(kit.sphere(0.04, [TOWER_X, y + 0.04 + 0.28, TOWER_Z], 'sunYellow', { detail: 0 }));
    return kit.finish(parts);
  },
};
