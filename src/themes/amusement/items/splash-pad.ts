import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A square play pad (2x2) of four coloured quadrants with a shallow pool of water in the middle. A big pink
// "mushroom" sprinkler stands in the centre and four short posts with blue spray cones stand near the corners.
const PAD = { half: 0.97, h: 0.05 }; // each quadrant is half-wide, full pad is 1.94
const QUAD: readonly PaletteColor[] = ['sunYellow', 'orange', 'mint', 'lime'];
const POOL = { r: 0.72, h: 0.03 }; // the shallow water (a flat round disc on the pad)
const RIM = { r: 0.74, tube: 0.03 }; // white ring round the water
const MUSH = { pole: 0.55, cap: 0.3 };
const POSTS = [[0.76, 0.76], [0.76, -0.76], [-0.76, 0.76], [-0.76, -0.76]] as const;
const POST_COLORS: readonly PaletteColor[] = ['red', 'blue', 'purple', 'teal'];

/** ลานน้ำพุเล่นน้ำ: colourful pad with shallow water and spray posts. */
export const item: ItemModel = {
  id: 'splash-pad',
  name: 'ลานน้ำพุเล่นน้ำ',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    // four coloured quadrants, a hair apart so they read as tiles
    const q = PAD.half - 0.01;
    QUAD.forEach((color, i) => {
      const sx = i % 2 === 0 ? 1 : -1;
      const sz = i < 2 ? 1 : -1;
      parts.push(kit.box([q, PAD.h, q], [sx * (q / 2 + 0.005), PAD.h / 2, sz * (q / 2 + 0.005)], color));
    });
    const top = PAD.h;
    parts.push(
      kit.cylinder(POOL.r, POOL.r, POOL.h, [0, top + POOL.h / 2, 0], 'skyBlue', { segments: 16, motion: { kind: 'water', water: 'pool' } }),
      kit.torus(RIM.r, RIM.tube, [0, top + POOL.h * 0.7, 0], 'white', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 24 }),
    );
    // the central sprinkler: a pole, a pink cap and drips falling from its rim
    parts.push(
      kit.cylinder(0.06, 0.08, MUSH.pole, [0, top + POOL.h + MUSH.pole / 2 - 0.02, 0], 'sunYellow', { segments: 8 }),
      kit.dome(MUSH.cap, [0, top + MUSH.pole, 0], 'pink', { segments: 12, scale: [1, 0.6, 1] }),
      kit.sphere(0.05, [0, top + MUSH.pole + MUSH.cap * 0.6 + 0.02, 0], 'white', { detail: 0 }),
    );
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      parts.push(kit.cone(0.035, 0.12, [Math.cos(a) * (MUSH.cap - 0.04), top + MUSH.pole - 0.06, Math.sin(a) * (MUSH.cap - 0.04)], 'glassBlue', { segments: 6, scale: [1, -1, 1] }));
    }
    // corner spray posts: a coloured post with a cap and a little fountain of water drops
    POSTS.forEach(([x, z], i) => {
      const c = POST_COLORS[i];
      parts.push(
        kit.cylinder(0.1, 0.12, 0.06, [x, top + 0.03, z], 'white', { segments: 8 }),
        kit.cylinder(0.05, 0.06, 0.34, [x, top + 0.2, z], c, { segments: 8 }),
        kit.sphere(0.07, [x, top + 0.4, z], c, { detail: 0 }),
        kit.cone(0.1, 0.22, [x, top + 0.57, z], 'glassBlue', { segments: 8, scale: [1, 1, 1] }),
        kit.sphere(0.04, [x, top + 0.7, z], 'glassBlue', { detail: 0 }),
      );
    });
    return kit.finish(parts);
  },
};
