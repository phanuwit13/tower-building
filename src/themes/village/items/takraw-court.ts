import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const FLOOR = 0.03;
const NET_TOP = 0.72;
const NET_BOT = 0.4;
const POST_X = 0.76;

/** ลานตะกร้อ: a small sand court with a net across the middle, a woven rattan ball and a bench. */
export const item: ItemModel = {
  id: 'takraw-court',
  name: 'ลานตะกร้อ',
  category: 'play',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.6, FLOOR, 2.9], [0, FLOOR / 2, 0], 'sand')];
    // court lines
    const L = 0.015;
    parts.push(
      kit.box([1.4, L, 0.05], [0, FLOOR + L / 2, 1.3], 'white'),
      kit.box([1.4, L, 0.05], [0, FLOOR + L / 2, -1.3], 'white'),
      kit.box([0.05, L, 2.65], [0.7, FLOOR + L / 2, 0], 'white'),
      kit.box([0.05, L, 2.65], [-0.7, FLOOR + L / 2, 0], 'white'),
      kit.box([1.4, L, 0.04], [0, FLOOR + L / 2, 0.01], 'white'),
    );
    // net posts and net
    for (const s of [-1, 1]) {
      parts.push(
        kit.cylinder(0.04, 0.045, NET_TOP + 0.04, [s * POST_X, FLOOR + (NET_TOP + 0.04) / 2, 0], 'wood', { segments: 8 }),
        kit.sphere(0.05, [s * POST_X, NET_TOP + FLOOR + 0.05, 0], 'red', { detail: 0 }),
      );
    }
    parts.push(
      kit.box([2 * POST_X - 0.05, 0.06, 0.03], [0, FLOOR + NET_TOP - 0.03, 0], 'white'),
      kit.box([2 * POST_X - 0.05, 0.02, 0.02], [0, FLOOR + NET_BOT, 0], 'white'),
      kit.box([2 * POST_X - 0.05, 0.015, 0.02], [0, FLOOR + (NET_TOP + NET_BOT) / 2, 0], 'stoneDark'),
    );
    for (let i = 0; i <= 8; i++) {
      const x = -POST_X + 0.05 + (i * (2 * POST_X - 0.1)) / 8;
      parts.push(kit.box([0.015, NET_TOP - NET_BOT - 0.04, 0.015], [x, FLOOR + (NET_TOP + NET_BOT) / 2 - 0.01, 0], 'stoneDark'));
    }
    // rattan ball with woven bands
    const R = 0.08;
    const ball: [number, number, number] = [0.35, FLOOR + R, 0.7];
    parts.push(
      kit.sphere(R, ball, 'wood', { detail: 1 }),
      kit.torus(R + 0.005, 0.012, ball, 'woodDark', { radialSegments: 4, tubularSegments: 8 }),
      kit.torus(R + 0.005, 0.012, ball, 'woodDark', { radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0] }),
      kit.torus(R + 0.005, 0.012, ball, 'woodDark', { radialSegments: 4, tubularSegments: 8, rotate: [Math.PI / 2, 0, 0] }),
    );
    // bench along the +x edge, facing the court
    const bx = 0.89;
    parts.push(
      kit.box([0.22, 0.05, 1.0], [bx, 0.31, 0.45], 'wood'),
      kit.box([0.04, 0.22, 1.0], [bx + 0.09, 0.45, 0.45], 'woodDark'),
    );
    for (const z of [0.05, 0.85]) parts.push(kit.box([0.14, 0.285, 0.07], [bx, 0.1425, z], 'woodDark'));
    // a pot of flowers at the corner
    parts.push(
      kit.cylinder(0.1, 0.07, 0.14, [0.85, 0.07, -1.2], 'terracotta', { segments: 8 }),
      kit.sphere(0.12, [0.85, 0.2, -1.2], 'leaf', { detail: 0 }),
      kit.sphere(0.04, [0.9, 0.3, -1.17], 'pink', { detail: 0 }),
      kit.sphere(0.04, [0.8, 0.28, -1.24], 'sunYellow', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
