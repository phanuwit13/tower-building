import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const POST_X = -0.18;
const POST_H = 1.5;
const LANTERN = { x: 0.2, y: 1.12 };
const BREATHE = { glow: true, light: 'breathe' } as const;

/** ตะเกียงริมทาง: a wooden post with an arm and a hanging lantern that glows at night. */
export const item: ItemModel = {
  id: 'lantern-post',
  name: 'ตะเกียงริมทาง',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.34, 0.1, 0.34], [POST_X, 0.05, 0], 'stone'),
      kit.box([0.12, POST_H - 0.1, 0.12], [POST_X, 0.1 + (POST_H - 0.1) / 2, 0], 'wood'),
      kit.box([0.17, 0.05, 0.17], [POST_X, POST_H + 0.025, 0], 'woodDark'),
      kit.box([LANTERN.x - POST_X + 0.06, 0.06, 0.07], [(LANTERN.x + POST_X) / 2 - 0.03 + 0.03, POST_H - 0.1, 0], 'woodDark'),
      // brace under the arm
      kit.box([0.22, 0.04, 0.05], [POST_X + 0.15, POST_H - 0.28, 0], 'woodDark', { rotate: [0, 0, 0.8] }),
      // chain and lantern
      kit.cylinder(0.012, 0.012, 0.18, [LANTERN.x, POST_H - 0.2, 0], 'stoneDark', { segments: 4 }),
      kit.cone(0.15, 0.1, [LANTERN.x, LANTERN.y + 0.19, 0], 'redDark', { segments: 8 }),
      kit.cylinder(0.12, 0.12, 0.03, [LANTERN.x, LANTERN.y + 0.125, 0], 'woodDark', { segments: 8 }),
      kit.cylinder(0.11, 0.1, 0.22, [LANTERN.x, LANTERN.y, 0], 'lampWarm', { segments: 8, ...BREATHE }),
      kit.cylinder(0.12, 0.12, 0.03, [LANTERN.x, LANTERN.y - 0.125, 0], 'woodDark', { segments: 8 }),
    ];
    for (const [dx, dz] of [[0.11, 0.11], [-0.11, 0.11], [0.11, -0.11], [-0.11, -0.11]]) {
      parts.push(kit.box([0.025, 0.22, 0.025], [LANTERN.x + dx * 0.95, LANTERN.y, dz * 0.95], 'woodDark'));
    }
    // flowers at the foot of the post
    parts.push(
      kit.sphere(0.1, [0.15, 0.09, -0.25], 'leaf', { detail: 0 }),
      kit.sphere(0.04, [0.17, 0.19, -0.24], 'pink', { detail: 0 }),
      kit.sphere(0.04, [0.1, 0.17, -0.3], 'sunYellow', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
