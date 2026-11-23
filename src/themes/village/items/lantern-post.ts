import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const POST_X = -0.22;
const POST_H = 1.5;
const POST_W = 0.18;
const LANTERN = { x: 0.2, y: 1.04, r: 0.17, h: 0.34 };
const BREATHE = { glow: true, light: 'breathe' } as const;

/** ตะเกียงริมทาง: a sturdy wooden post with an arm and a big hanging lantern that glows warm at night. */
export const item: ItemModel = {
  id: 'lantern-post',
  name: 'ตะเกียงริมทาง',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const top = LANTERN.y + LANTERN.h / 2;
    const parts: Part[] = [
      kit.box([0.42, 0.1, 0.42], [POST_X, 0.05, 0], 'stone'),
      kit.box([POST_W, POST_H - 0.1, POST_W], [POST_X, 0.1 + (POST_H - 0.1) / 2, 0], 'wood'),
      kit.box([POST_W + 0.06, 0.06, POST_W + 0.06], [POST_X, POST_H + 0.03, 0], 'woodDark'),
      kit.box([LANTERN.x - POST_X + 0.1, 0.08, 0.09], [(LANTERN.x + POST_X) / 2, POST_H - 0.1, 0], 'woodDark'),
      kit.box([0.3, 0.05, 0.06], [POST_X + 0.2, POST_H - 0.3, 0], 'woodDark', { rotate: [0, 0, 0.8] }), // brace
      kit.cylinder(0.015, 0.015, POST_H - 0.14 - top + 0.04, [LANTERN.x, (POST_H - 0.14 + top) / 2, 0], 'stoneDark', { segments: 4 }),
      kit.cone(LANTERN.r + 0.05, 0.14, [LANTERN.x, top + 0.07, 0], 'red', { segments: 8 }),
      kit.cylinder(LANTERN.r + 0.02, LANTERN.r + 0.02, 0.04, [LANTERN.x, top + 0.01, 0], 'woodDark', { segments: 8 }),
      kit.cylinder(LANTERN.r, LANTERN.r - 0.02, LANTERN.h, [LANTERN.x, LANTERN.y, 0], 'lampWarm', { segments: 8, ...BREATHE }),
      kit.cylinder(LANTERN.r + 0.02, LANTERN.r + 0.02, 0.04, [LANTERN.x, LANTERN.y - LANTERN.h / 2, 0], 'woodDark', { segments: 8 }),
    ];
    const k = LANTERN.r + 0.01;
    for (const [dx, dz] of [[k, 0], [-k, 0], [0, k], [0, -k]]) {
      parts.push(kit.box([0.03, LANTERN.h, 0.03], [LANTERN.x + dx, LANTERN.y, dz], 'woodDark'));
    }
    // flowers at the foot of the post
    parts.push(
      kit.sphere(0.1, [0.15, 0.09, -0.3], 'leaf', { detail: 0 }),
      kit.sphere(0.04, [0.17, 0.19, -0.29], 'pink', { detail: 0 }),
      kit.sphere(0.04, [0.1, 0.17, -0.35], 'sunYellow', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
