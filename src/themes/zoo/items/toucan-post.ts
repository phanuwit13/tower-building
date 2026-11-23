import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A carved, painted totem-style post (no faces of gods, just bands and zigzags) with a toucan on top.
const G = 0.03;
const POST = { r: 0.15, h: 0.95 };
const TOP = G + POST.h;
const BANDS: Array<[number, number, 'red' | 'sunYellow' | 'teal' | 'orange']> = [[0.2, 0.1, 'red'], [0.42, 0.1, 'sunYellow'], [0.64, 0.1, 'teal'], [0.84, 0.08, 'orange']];

/** นกทูแคนบนเสา: a carved post with a toucan with a big orange beak on top. */
export const item: ItemModel = {
  id: 'toucan-post',
  name: 'นกทูแคนบนเสา',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const by = TOP + 0.2;
    const parts: Part[] = [
      kit.box([0.96, G, 0.96], [0, G / 2, 0], 'lime'),
      kit.cylinder(0.28, 0.32, 0.12, [0, G + 0.06, 0], 'stone', { segments: 10 }),
      kit.cylinder(POST.r, POST.r + 0.02, POST.h - 0.12, [0, G + 0.12 + (POST.h - 0.12) / 2, 0], 'wood', { segments: 10 }),
      kit.cylinder(POST.r + 0.04, POST.r + 0.04, 0.05, [0, TOP - 0.02, 0], 'woodDark', { segments: 10 }),
      // toucan: black body, white bib, big banded beak
      kit.sphere(0.15, [0, by, 0], 'charcoal', { scale: [0.9, 1.2, 0.9] }),
      kit.sphere(0.1, [0.07, by + 0.03, 0], 'white', { detail: 0, scale: [0.7, 1.2, 1] }),
      kit.sphere(0.14, [0.03, by + 0.26, 0], 'charcoal'),
      kit.sphere(0.07, [0.12, by + 0.2, 0], 'sunYellow', { detail: 0, scale: [0.6, 1.1, 1.2] }),
      kit.cone(0.055, 0.2, [-0.12, by - 0.2, 0], 'charcoal', { segments: 6, rotate: [0, 0, 0.5] }), // tail
      // beak: big orange cone pointing forward, red tip, yellow top stripe
      kit.cone(0.1, 0.36, [0.31, by + 0.22, 0], 'orange', { segments: 8, rotate: [0, 0, -Math.PI / 2 - 0.15] }),
      kit.sphere(0.035, [0.46, by + 0.16, 0], 'red', { detail: 0 }),
      kit.cone(0.05, 0.3, [0.28, by + 0.3, 0], 'sunYellow', { segments: 6, rotate: [0, 0, -Math.PI / 2 - 0.2] }),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.sphere(0.055, [0.1, by + 0.3, s * 0.1], 'skyBlue', { detail: 0, scale: [0.6, 1, 1] }),
        kit.sphere(0.035, [0.13, by + 0.3, s * 0.105], 'white', { detail: 0 }),
        kit.sphere(0.02, [0.16, by + 0.3, s * 0.108], 'charcoal', { detail: 0 }),
        kit.sphere(0.08, [-0.02, by - 0.02, s * 0.14], 'charcoal', { detail: 0, scale: [1, 1.7, 0.45] }), // wings
        kit.box([0.1, 0.03, 0.04], [0.04, TOP + 0.03, s * 0.06], 'orange'), // feet
      );
    }
    for (const [y, h, c] of BANDS) parts.push(kit.cylinder(POST.r + 0.012, POST.r + 0.012, h, [0, G + y + 0.1, 0], c, { segments: 10 }));
    // carved zigzag on the front
    for (let i = 0; i < 3; i++) parts.push(kit.box([0.03, 0.1, 0.06], [POST.r + 0.02, G + 0.31 + i * 0.22, 0], 'woodDark', { rotate: [0, 0, i % 2 ? 0.5 : -0.5] }));
    parts.push(kit.sphere(0.09, [0.35, 0.1, 0.3], 'leaf', { detail: 0, scale: [1.2, 0.9, 1.2] }), kit.sphere(0.04, [0.4, 0.2, 0.32], 'pink', { detail: 0 }), kit.sphere(0.09, [-0.3, 0.1, -0.35], 'leafDark', { detail: 0, scale: [1.2, 0.9, 1.2] }));
    return kit.finish(parts);
  },
};
