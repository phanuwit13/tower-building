import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const POST_H = 1.2;
const BOWL = { y: 1.2, h: 0.16 };

/** คบเพลิงไม้: a bamboo-style torch post with a bowl on top and a flame that glows and breathes at night. */
export const item: ItemModel = {
  id: 'tiki-torch',
  name: 'คบเพลิงไม้',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.38, 0.38, 0.03, [0, 0.015, 0], 'sand', { segments: 12 }),
      kit.cylinder(0.05, 0.055, POST_H, [0, POST_H / 2, 0], 'wood', { segments: 8 }),
      kit.cylinder(0.16, 0.07, BOWL.h, [0, BOWL.y + BOWL.h / 2 - 0.02, 0], 'woodDark', { segments: 8 }),
    ];
    for (const y of [0.3, 0.6, 0.9]) parts.push(kit.cylinder(0.065, 0.065, 0.03, [0, y, 0], 'woodDark', { segments: 8 })); // bamboo nodes
    const glow = { glow: true, light: 'breathe' } as const;
    parts.push(
      kit.sphere(0.09, [0, 1.4, 0], 'sunYellow', { detail: 0, ...glow }),
      kit.cone(0.1, 0.32, [0, 1.52, 0], 'orange', { segments: 8, ...glow }),
    );
    return kit.finish(parts);
  },
};
