import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A long clay trough with a bed of glowing orange/red embers (seen from above, breathing at night; no
// flames) and a row of fat bamboo tubes leaning over it on a rail. Tubes run green, then tan, with
// charred dark tops.
const TROUGH = { w: 0.6, h: 0.3, d: 1.7 };
const BED_Y = TROUGH.h + 0.01;
const TUBES = 8;
const FOOT: Vec3 = [-0.1, BED_Y, 0]; // tube bottoms rest in the embers' bed
const TOP: Vec3 = [0.32, 0.78, 0]; // tube tops lean towards +x
const RAIL_X = 0.22;
const BREATHE = { glow: true, light: 'breathe' } as const;

const lerp = (t: number, z: number): Vec3 => [FOOT[0] + (TOP[0] - FOOT[0]) * t, FOOT[1] + (TOP[1] - FOOT[1]) * t, z];

/** ข้าวหลามเผา: a long grill of bamboo tubes over glowing embers. */
export const item: ItemModel = {
  id: 'bamboo-rice-grill',
  name: 'ข้าวหลามเผา',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const railY = FOOT[1] + (TOP[1] - FOOT[1]) * ((RAIL_X - FOOT[0]) / (TOP[0] - FOOT[0]));
    const parts: Part[] = [
      kit.box([TROUGH.w, TROUGH.h - 0.04, TROUGH.d], [0, (TROUGH.h - 0.04) / 2, 0], 'terracotta'),
      // rim round the bed, and the dark ash bed itself
      kit.box([TROUGH.w, 0.06, 0.06], [0, TROUGH.h - 0.01, -TROUGH.d / 2 + 0.03], 'redDark'),
      kit.box([TROUGH.w, 0.06, 0.06], [0, TROUGH.h - 0.01, TROUGH.d / 2 - 0.03], 'redDark'),
      kit.box([0.05, 0.06, TROUGH.d], [-TROUGH.w / 2 + 0.025, TROUGH.h - 0.01, 0], 'redDark'),
      kit.box([0.05, 0.06, TROUGH.d], [TROUGH.w / 2 - 0.025, TROUGH.h - 0.01, 0], 'redDark'),
      kit.box([TROUGH.w - 0.1, 0.02, TROUGH.d - 0.1], [0, TROUGH.h - 0.03 + 0.02, 0], 'charcoal'),
      // rail the tubes lean on, held by two end posts that stay below the tube tops
      kit.box([0.04, 0.04, TROUGH.d - 0.1], [RAIL_X + 0.02, railY - 0.07, 0], 'woodDark'),
    ];
    for (const z of [-0.8, 0.8]) parts.push(kit.box([0.04, railY - 0.07 - TROUGH.h + 0.02, 0.04], [RAIL_X + 0.02, (railY - 0.07 + TROUGH.h - 0.02) / 2, z], 'woodDark'));
    // bamboo tubes, fat, in three colour bands; the tip is charred
    const pitch = 1.5 / (TUBES - 1);
    for (let i = 0; i < TUBES; i++) {
      const z = -0.75 + i * pitch;
      const bands: [number, number, 'lime' | 'sand' | 'charcoal'][] = [[0, 0.5, 'lime'], [0.5, 0.82, 'sand'], [0.82, 1, 'charcoal']];
      for (const [a, b, c] of bands) parts.push(rod(kit, lerp(a, z), lerp(b, z), 0.065, c, { segments: 6 }));
      parts.push(kit.sphere(0.04, [lerp(0.5, z)[0], lerp(0.5, z)[1], z + 0.0], 'leafDark', { detail: 0, scale: [1.4, 0.5, 1.4], rotate: [0, 0, 0.8] }));
    }
    // embers: a bed of glowing dots, in three columns the whole length of the trough
    const ROWS = 9;
    for (let r = 0; r < ROWS; r++) {
      const z = -0.75 + (1.5 * r) / (ROWS - 1);
      [-0.2, -0.04, 0.12].forEach((x, k) => {
        parts.push(kit.sphere(0.05, [x, BED_Y + 0.03, z + (k % 2 ? 0.05 : 0)], (r + k) % 2 ? 'orange' : 'red', { detail: 0, ...BREATHE }));
      });
    }
    return kit.finish(parts);
  },
};
