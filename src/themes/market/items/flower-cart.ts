import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { rod, wheel } from '../../../models/parts';

// A wooden flower cart (1×2, long side along z): buckets of flowers on the bed, a tall lamp on a post, wheels
// and push handles at the back (-z).
const BED = { w: 0.66, d: 1.1, y: 0.2, h: 0.08, z: 0.05 };
const BUCKET = { r: 0.1, h: 0.16 };
const BED_TOP = BED.y + BED.h;
const FLOWER_Y = BED_TOP + BUCKET.h; // the rim: flowers bend from here
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, FLOWER_Y, 0], amount: 0.12 };
const SLOTS: Array<[number, number, PaletteColor, PaletteColor]> = [
  [-0.17, 0.5, 'red', 'pink'],
  [0.17, 0.5, 'sunYellow', 'orange'],
  [-0.17, 0.22, 'purple', 'pink'],
  [0.17, 0.22, 'pink', 'red'],
  [-0.17, -0.06, 'orange', 'sunYellow'],
  [0.17, -0.06, 'white', 'sunYellow'],
];

/** รถเข็นดอกไม้: a wooden cart loaded with flower buckets. */
export const item: ItemModel = {
  id: 'flower-cart',
  name: 'รถเข็นดอกไม้',
  category: 'building',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BED.w, BED.h, BED.d], [0, BED.y + BED.h / 2, BED.z], 'wood'),
      kit.box([BED.w + 0.04, 0.04, BED.d + 0.04], [0, BED_TOP + 0.02 - 0.04, BED.z], 'woodDark'),
      kit.box([BED.w - 0.04, 0.1, 0.04], [0, BED.y + BED.h + 0.05, BED.z + BED.d / 2 - 0.02], 'woodDark'), // low front board
      // handles at the back, legs at the front
      rod(kit, [-0.2, BED.y + 0.03, BED.z - BED.d / 2], [-0.2, BED.y + 0.2, -0.88], 0.022, 'woodDark', { segments: 6 }),
      rod(kit, [0.2, BED.y + 0.03, BED.z - BED.d / 2], [0.2, BED.y + 0.2, -0.88], 0.022, 'woodDark', { segments: 6 }),
      kit.box([0.06, BED.y, 0.06], [-0.24, BED.y / 2, 0.52], 'woodDark'),
      kit.box([0.06, BED.y, 0.06], [0.24, BED.y / 2, 0.52], 'woodDark'),
      // lamp post at the back corner with a warm bulb
      kit.cylinder(0.02, 0.02, 0.72, [0.26, BED_TOP + 0.36, -0.42], 'charcoal', { segments: 6 }),
      kit.sphere(0.06, [0.26, BED_TOP + 0.76, -0.42], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }),
      kit.box([0.3, 0.03, 0.03], [0.11, BED_TOP + 0.72, -0.42], 'charcoal'),
      kit.sphere(0.045, [-0.04, BED_TOP + 0.7, -0.42], 'pink', { detail: 0, glow: true, light: 'breathe' }),
    ];
    for (const sx of [-1, 1]) parts.push(...wheel(kit, { at: [sx * (BED.w / 2 + 0.04), 0.16, -0.1], radius: 0.13, tube: 0.03, axis: 'x', color: 'woodDark', hubColor: 'sunYellow' }));
    for (const [x, z, c1, c2] of SLOTS) {
      parts.push(
        kit.cylinder(BUCKET.r + 0.02, BUCKET.r - 0.015, BUCKET.h, [x, BED_TOP + BUCKET.h / 2, z], 'stone', { segments: 8 }),
        kit.sphere(0.115, [x, FLOWER_Y + 0.05, z], 'leaf', { detail: 0, scale: [1, 0.7, 1], motion: SWAY }),
        kit.sphere(0.055, [x - 0.05, FLOWER_Y + 0.12, z + 0.02], c1, { detail: 0, motion: SWAY }),
        kit.sphere(0.055, [x + 0.05, FLOWER_Y + 0.11, z - 0.03], c2, { detail: 0, motion: SWAY }),
        kit.sphere(0.05, [x + 0.01, FLOWER_Y + 0.15, z + 0.04], c2, { detail: 0, motion: SWAY }),
      );
    }
    return kit.finish(parts);
  },
};
