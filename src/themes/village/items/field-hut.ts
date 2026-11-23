import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { gableRoof, rod } from '../../../models/parts';

// An open bamboo hut on stilts in a rice field: four bamboo posts, a slatted floor, low side rails, a thick
// thatched roof and a bamboo ladder on the +x side.
const FLOOR = { y: 0.65, h: 0.06, half: 0.74 };
const POST_H = 1.55;
const POST = 0.66;
const ROOF = { rise: 0.52, eave: 0.18, length: 1.9, thickness: 0.12 };

/** เถียงนา: a small open bamboo hut on stilts with a thatched roof, the kind that stands in a rice field. */
export const item: ItemModel = {
  id: 'field-hut',
  name: 'เถียงนา',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const x of [-POST, POST]) {
      for (const z of [-POST, POST]) {
        parts.push(
          kit.cylinder(0.05, 0.05, POST_H, [x, POST_H / 2, z], 'sand', { segments: 8 }),
          kit.cylinder(0.065, 0.065, 0.03, [x, 0.4, z], 'wood', { segments: 8 }), // a bamboo node
        );
      }
    }
    // floor: bearers and slats
    for (const x of [-POST, POST]) parts.push(kit.box([0.07, 0.06, 2 * FLOOR.half], [x, FLOOR.y - 0.05, 0], 'woodDark'));
    for (let i = 0; i < 8; i++) {
      parts.push(kit.cylinder(0.035, 0.035, 2 * FLOOR.half, [-0.63 + 0.18 * i, FLOOR.y + 0.0, 0], i % 2 ? 'sand' : 'lime', { segments: 6, rotate: [Math.PI / 2, 0, 0] }));
    }
    // low rails on the back and the two sides
    const railY = FLOOR.y + 0.3;
    parts.push(kit.box([0.04, 0.05, 2 * POST], [-POST, railY, 0], 'lime'));
    for (const z of [-POST, POST]) parts.push(kit.box([2 * POST, 0.05, 0.04], [0, railY, z], 'lime'));
    // roof: thick thatch, gable ends closed with a lighter triangle
    parts.push(
      ...gableRoof(kit, { at: [0, POST_H, 0], length: ROOF.length, width: 2 * POST + 0.1, rise: ROOF.rise, eave: ROOF.eave, color: 'sunYellow', ridge: 'brass', thickness: ROOF.thickness }),
      kit.wedge([2 * POST + 0.1, ROOF.rise - 0.1, 1.5], [0, POST_H + (ROOF.rise - 0.1) / 2, 0], 'sand'),
    );
    // things in the hut: a red mat, a water jug, a straw hat and a basket
    parts.push(
      kit.box([0.6, 0.03, 0.8], [-0.1, FLOOR.y + 0.05 + 0.0, 0.1], 'red'),
      kit.box([0.07, 0.034, 0.8], [-0.1, FLOOR.y + 0.052, 0.1], 'cream'),
      kit.cylinder(0.09, 0.07, 0.2, [-0.45, FLOOR.y + 0.16, -0.4], 'terracotta', { segments: 8 }),
      kit.cone(0.15, 0.1, [0.0, FLOOR.y + 0.11, 0.2], 'sunYellow', { segments: 10 }),
      kit.cylinder(0.12, 0.1, 0.12, [-0.4, FLOOR.y + 0.12, 0.45], 'wood', { segments: 8 }),
    );
    // ladder
    const lx = FLOOR.half + 0.02;
    for (const z of [-0.14, 0.14]) parts.push(rod(kit, [lx + 0.2, 0.03, z], [lx, FLOOR.y + 0.02, z], 0.025, 'sand', { segments: 6 }));
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      parts.push(kit.box([0.04, 0.03, 0.3], [lx + 0.2 * (1 - t), 0.03 + (FLOOR.y - 0.01) * t, 0], 'wood'));
    }
    return kit.finish(parts);
  },
};
