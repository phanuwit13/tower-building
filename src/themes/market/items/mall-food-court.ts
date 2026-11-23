import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow } from '../../../models/parts';

// A mall food hall (2×3, long side along z, front +x): a glass roof over a back wall of three
// coloured counters, tables and stools out front, and a navy sign with a pink bowl neon.
const FLOOR_H = 0.03;
const WALL = { x: -0.93, t: 0.1, h: 1.12 }; // back wall, x- side
const WALL_TOP = FLOOR_H + WALL.h;
const ROOF = { x0: -0.98, x1: 0, y: 1.15 };
const COUNTER_Z = [-0.95, 0, 0.95];
const COUNTER_COLORS = ['red', 'orange', 'teal'] as const;
const FOOD_COLORS = ['pink', 'lime', 'sunYellow'] as const;
const POST_Z = [-1.4, -0.7, 0, 0.7, 1.4];
const BULBS = 15;
const TABLE_X = [0.3, 0.8];
const TABLE_Z = [-1.0, 0, 1.0];
const TABLE_COLORS = ['sunYellow', 'pink', 'lime', 'blue', 'orange', 'purple'] as const;

/** ศูนย์อาหารในห้าง: a glass-roofed food hall with counters, tables and a chase-lit sign. */
export const item: ItemModel = {
  id: 'mall-food-court',
  name: 'ศูนย์อาหารในห้าง',
  category: 'food',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const wallFace = WALL.x + WALL.t / 2;
    const parts: Part[] = [
      kit.box([1.96, FLOOR_H, 2.96], [0, FLOOR_H / 2, 0], 'stone'),
      kit.box([WALL.t, WALL.h, 2.9], [WALL.x, FLOOR_H + WALL.h / 2, 0], 'cream'),
      kit.box([WALL.t + 0.02, 0.06, 2.9], [WALL.x, WALL_TOP - 0.03, 0], 'white'),
      // glass roof on beams and posts
      kit.box([ROOF.x1 - ROOF.x0, 0.05, 2.9], [(ROOF.x0 + ROOF.x1) / 2, ROOF.y, 0], 'glassBlue'),
    ];
    for (const z of POST_Z) {
      parts.push(
        kit.box([ROOF.x1 - ROOF.x0, 0.05, 0.07], [(ROOF.x0 + ROOF.x1) / 2, ROOF.y - 0.05, z], 'white'),
        kit.box([0.08, ROOF.y - 0.05 - FLOOR_H, 0.08], [-0.04, (FLOOR_H + ROOF.y - 0.05) / 2, z], 'white'),
      );
    }
    COUNTER_Z.forEach((z, i) => {
      parts.push(
        kit.box([0.34, 0.4, 0.7], [-0.68, FLOOR_H + 0.2, z], COUNTER_COLORS[i]),
        kit.box([0.4, 0.04, 0.78], [-0.68, FLOOR_H + 0.42, z], 'white'),
        ...glassWindow(kit, { at: [wallFace, 0.8, z], facing: 'x+', w: 0.55, h: 0.22 }),
        // a bowl of food on each counter
        kit.cylinder(0.1, 0.06, 0.06, [-0.68, FLOOR_H + 0.47, z], 'white', { segments: 8 }),
        kit.sphere(0.08, [-0.68, FLOOR_H + 0.52, z], FOOD_COLORS[i], { detail: 0, scale: [1, 0.7, 1] }),
      );
    });
    // chase bulbs along the front roof edge
    for (let index = 0; index < BULBS; index++) {
      const z = -1.4 + (index * 2.8) / (BULBS - 1);
      parts.push(kit.sphere(0.04, [ROOF.x1 + 0.01, ROOF.y, z], 'lampWarm', { detail: 0, glow: true, light: 'chase', chase: { index, count: BULBS } }));
    }
    // navy sign on the back wall with a pink bowl-and-steam neon
    const signY = WALL_TOP + 0.28;
    parts.push(
      kit.box([0.1, 0.5, 1.7], [WALL.x, signY, 0], 'navy'),
      kit.torus(0.2, 0.03, [wallFace + 0.03, signY + 0.04, 0], 'pink', { arc: Math.PI, rotate: [0, Math.PI / 2, Math.PI], glow: true }),
      kit.box([0.04, 0.03, 0.46], [wallFace + 0.03, signY + 0.04, 0], 'pink', { glow: true }),
    );
    for (const z of [-0.1, 0, 0.1]) parts.push(kit.box([0.03, 0.12, 0.03], [wallFace + 0.03, signY + 0.14, z], 'pink', { glow: true }));
    // tables with two stools each
    let n = 0;
    for (const x of TABLE_X) {
      for (const z of TABLE_Z) {
        const c = TABLE_COLORS[n++ % TABLE_COLORS.length];
        parts.push(
          kit.cylinder(0.17, 0.17, 0.04, [x, FLOOR_H + 0.34, z], c, { segments: 8 }),
          kit.cylinder(0.03, 0.03, 0.32, [x, FLOOR_H + 0.16, z], 'chrome', { segments: 6 }),
          kit.cylinder(0.08, 0.08, 0.2, [x, FLOOR_H + 0.1, z - 0.3], 'stoneDark', { segments: 8 }),
          kit.cylinder(0.08, 0.08, 0.2, [x, FLOOR_H + 0.1, z + 0.3], 'stoneDark', { segments: 8 }),
        );
      }
    }
    return kit.finish(parts);
  },
};
