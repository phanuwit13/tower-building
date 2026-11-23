import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A wooden mooring post on a sand pad, with a friendly white seagull on top (facing +x).
const BASE_H = 0.03;
const POST = { r: 0.1, top: 0.9 };

/** นกนางนวลบนเสา: a wooden post with a white seagull on top. */
export const item: ItemModel = {
  id: 'seagull-post',
  name: 'นกนางนวลบนเสา',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const y = POST.top; // the gull stands here
    const parts: Part[] = [
      kit.cylinder(0.42, 0.44, BASE_H, [0, BASE_H / 2, 0], 'sand', { segments: 12 }),
      kit.cylinder(POST.r, POST.r + 0.02, POST.top - BASE_H, [0, (POST.top + BASE_H) / 2, 0], 'wood', { segments: 8 }),
      kit.cylinder(POST.r + 0.02, POST.r + 0.02, 0.04, [0, POST.top - 0.01, 0], 'woodDark', { segments: 8 }),
      kit.torus(POST.r + 0.01, 0.025, [0, 0.55, 0], 'sand', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 8 }), // rope turn
      // legs and feet
      kit.cylinder(0.014, 0.014, 0.07, [0.02, y + 0.04, 0.04], 'orange', { segments: 4 }),
      kit.cylinder(0.014, 0.014, 0.07, [0.02, y + 0.04, -0.04], 'orange', { segments: 4 }),
      // body, tail, folded wings with dark tips
      kit.sphere(0.13, [-0.01, y + 0.17, 0], 'white', { scale: [1.35, 0.9, 0.85] }),
      kit.box([0.14, 0.03, 0.1], [-0.2, y + 0.18, 0], 'stone', { rotate: [0, 0, 0.25] }),
      kit.sphere(0.1, [-0.03, y + 0.2, 0.1], 'stone', { detail: 0, scale: [1.7, 0.5, 0.45] }),
      kit.sphere(0.1, [-0.03, y + 0.2, -0.1], 'stone', { detail: 0, scale: [1.7, 0.5, 0.45] }),
      kit.sphere(0.04, [-0.17, y + 0.2, 0.1], 'charcoal', { detail: 0, scale: [1.4, 0.5, 0.6] }),
      kit.sphere(0.04, [-0.17, y + 0.2, -0.1], 'charcoal', { detail: 0, scale: [1.4, 0.5, 0.6] }),
      // head, beak, eyes
      kit.sphere(0.075, [0.14, y + 0.31, 0], 'white'),
      kit.cone(0.03, 0.12, [0.25, y + 0.29, 0], 'orange', { segments: 6, rotate: [0, 0, -Math.PI / 2 - 0.2] }),
      kit.sphere(0.02, [0.18, y + 0.34, 0.05], 'charcoal', { detail: 0 }),
      kit.sphere(0.02, [0.18, y + 0.34, -0.05], 'charcoal', { detail: 0 }),
    ];
    return kit.finish(parts);
  },
};
