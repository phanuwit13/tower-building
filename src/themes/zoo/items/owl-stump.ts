import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A tree stump with a round owl on top, big eyes, facing +x.
const STUMP = { r: 0.28, h: 0.45 };
const TOP = STUMP.h + 0.02;
const OWL = { r: 0.25, y: TOP + 0.3 };

/** นกฮูกบนตอไม้: a round owl on a tree stump. */
export const item: ItemModel = {
  id: 'owl-stump',
  name: 'นกฮูกบนตอไม้',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const eye = (z: number): Part[] => [
      kit.cylinder(0.095, 0.095, 0.02, [0.19, OWL.y + 0.09, z], 'cream', { segments: 12, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.065, 0.065, 0.02, [0.205, OWL.y + 0.09, z], 'sunYellow', { segments: 12, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.037, 0.037, 0.02, [0.22, OWL.y + 0.09, z], 'charcoal', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.sphere(0.012, [0.232, OWL.y + 0.105, z + 0.012], 'white', { detail: 0 }),
    ];
    const parts: Part[] = [
      // stump: flared roots, trunk, pale cut top with two rings
      kit.cylinder(STUMP.r + 0.07, STUMP.r + 0.1, 0.1, [0, 0.05, 0], 'woodDark', { segments: 10 }),
      kit.cylinder(STUMP.r, STUMP.r + 0.06, STUMP.h - 0.1, [0, 0.1 + (STUMP.h - 0.1) / 2, 0], 'wood', { segments: 10 }),
      kit.cylinder(STUMP.r + 0.01, STUMP.r + 0.01, 0.02, [0, STUMP.h + 0.01, 0], 'sand', { segments: 10 }),
      kit.cylinder(0.17, 0.17, 0.004, [0, TOP + 0.002, -0.0], 'wood', { segments: 10 }),
      kit.cylinder(0.08, 0.08, 0.006, [0, TOP + 0.003, 0], 'sand', { segments: 8 }),
      // a dark knot hole on the front
      kit.sphere(0.06, [STUMP.r + 0.01, 0.22, 0.06], 'bark', { detail: 0, scale: [0.3, 1.3, 1] }),
      // the owl: egg body, pale tummy, folded wings
      kit.sphere(OWL.r, [0, OWL.y, 0], 'wood', { scale: [0.95, 1.2, 0.95] }),
      kit.sphere(0.17, [0.1, OWL.y - 0.1, 0], 'sand', { scale: [0.6, 1.2, 0.85] }),
      kit.sphere(0.12, [-0.02, OWL.y - 0.02, 0.21], 'woodDark', { detail: 0, scale: [0.6, 1.5, 0.45] }),
      kit.sphere(0.12, [-0.02, OWL.y - 0.02, -0.21], 'woodDark', { detail: 0, scale: [0.6, 1.5, 0.45] }),
      // ear tufts
      kit.cone(0.05, 0.12, [0, OWL.y + 0.34, 0.12], 'woodDark', { segments: 6, rotate: [0.35, 0, 0] }),
      kit.cone(0.05, 0.12, [0, OWL.y + 0.34, -0.12], 'woodDark', { segments: 6, rotate: [-0.35, 0, 0] }),
      ...eye(0.1),
      ...eye(-0.1),
      // beak and feet
      kit.cone(0.035, 0.08, [0.26, OWL.y + 0.0, 0], 'orange', { segments: 6, rotate: [0, 0, -Math.PI / 2 - 0.3] }),
      kit.box([0.09, 0.03, 0.05], [0.14, TOP + 0.015, 0.07], 'orange'),
      kit.box([0.09, 0.03, 0.05], [0.14, TOP + 0.015, -0.07], 'orange'),
    ];
    return kit.finish(parts);
  },
};
