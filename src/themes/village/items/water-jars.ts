import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// 1x2, long side along z. A row of three big glazed water jars on a plank platform, lids on, a dipper on the middle lid.
const DECK_H = 0.05;
const R = 0.26;
const FOOT_H = 0.05;
const CY = DECK_H + FOOT_H + R - 0.03; // ball centre (its bottom sinks into the foot)
const NECK_Y = CY + R * 0.95; // top of the ball
/** [z, glaze colour, lid colour]. */
const JARS: Array<[number, 'teal' | 'terracotta' | 'blue', 'sand' | 'wood']> = [
  [0.6, 'teal', 'sand'], [0, 'terracotta', 'wood'], [-0.6, 'blue', 'sand'],
];

/** โอ่งน้ำ: three big glazed water jars with lids and a dipper. */
export const item: ItemModel = {
  id: 'water-jars',
  name: 'โอ่งน้ำ',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.98, 0.03, 1.98], [0, 0.015, 0], 'lime'),
      kit.box([0.74, DECK_H, 1.9], [0, DECK_H / 2, 0], 'wood'), // plank platform
      kit.box([0.74, 0.012, 0.02], [0, DECK_H + 0.003, 0.3], 'woodDark'),
      kit.box([0.74, 0.012, 0.02], [0, DECK_H + 0.003, -0.3], 'woodDark'),
    ];
    for (const [z, glaze, lid] of JARS) {
      parts.push(
        kit.cylinder(0.17, 0.2, FOOT_H, [0, DECK_H + FOOT_H / 2, z], 'woodDark', { segments: 10 }),
        kit.sphere(R, [0, CY, z], glaze, { scale: [1, 0.95, 1] }),
        kit.torus(R * 0.99, 0.02, [0, CY + 0.06, z], 'sunYellow', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }), // glaze band
        kit.cylinder(0.16, 0.19, 0.07, [0, NECK_Y + 0.01, z], glaze, { segments: 12 }),
        kit.cylinder(0.2, 0.2, 0.03, [0, NECK_Y + 0.055, z], 'sunYellow', { segments: 12 }), // lip
        kit.dome(0.2, [0, NECK_Y + 0.07, z], lid, { segments: 12, scale: [1, 0.55, 1] }), // lid
        kit.sphere(0.03, [0, NECK_Y + 0.19, z], 'woodDark', { detail: 0 }),
      );
    }
    // dipper: a coconut-shell scoop with a long handle, resting on the middle lid
    const LID_Y = NECK_Y + 0.07;
    parts.push(
      kit.dome(0.065, [0.1, LID_Y + 0.085, 0.02], 'bark', { segments: 8 }),
      rod(kit, [0.12, LID_Y + 0.115, 0.02], [0.27, LID_Y + 0.045, 0.02], 0.016, 'wood', { segments: 4 }),
    );
    return kit.finish(parts);
  },
};
