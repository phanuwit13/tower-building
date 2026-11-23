import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const SEAT_Y = 0.31;
const X = -0.2; // both chairs sit back a little from the front edge

/** One armchair facing +x, 0.62 deep and 0.66 wide, centred at (X, z). */
function armchair(kit: StyleKit, z: number, body: PaletteColor, cushion: PaletteColor): Part[] {
  return [
    kit.box([0.62, 0.18, 0.66], [X, 0.14, z], body), // base
    kit.box([0.14, 0.57, 0.66], [X - 0.24, 0.335, z], body), // back
    kit.box([0.12, 0.08, 0.7], [X - 0.24, 0.62, z], cushion), // back-top roll
    kit.box([0.52, 0.2, 0.12], [X + 0.02, 0.35, z - 0.27], body), // arms
    kit.box([0.52, 0.2, 0.12], [X + 0.02, 0.35, z + 0.27], body),
    kit.box([0.4, 0.07, 0.42], [X + 0.07, SEAT_Y - 0.035, z], cushion), // seat cushion
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => kit.cylinder(0.03, 0.03, 0.06, [X + sx * 0.25, 0.03, z + sz * 0.27], 'woodDark', { segments: 6 }))),
  ];
}

/** อาร์มแชร์คู่: two armchairs side by side on a rug, with a side table and a glowing table lamp. */
export const item: ItemModel = {
  id: 'armchairs-pair',
  name: 'อาร์มแชร์คู่',
  category: 'seating',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.5, 0.03, 1.9], [0, 0.015, 0], 'sand'),
      kit.box([1.3, 0.035, 1.7], [0, 0.0175, 0], 'mint'),
      ...armchair(kit, -0.62, 'orange', 'sunYellow'),
      ...armchair(kit, 0.62, 'purple', 'pink'),
      // side table (top 0.4) with a lamp
      kit.cylinder(0.13, 0.15, 0.03, [X, 0.035, 0], 'woodDark', { segments: 10 }),
      kit.cylinder(0.04, 0.04, 0.33, [X, 0.2, 0], 'woodDark', { segments: 8 }),
      kit.cylinder(0.21, 0.21, 0.04, [X, 0.38, 0], 'wood', { segments: 12 }),
      kit.cylinder(0.05, 0.06, 0.05, [X, 0.425, 0], 'brass', { segments: 8 }),
      kit.cylinder(0.08, 0.14, 0.17, [X, 0.54, 0], 'lampWarm', { segments: 10, glow: true, light: 'breathe' }),
      kit.cylinder(0.035, 0.035, 0.05, [X + 0.12, 0.425, 0.08], 'white', { segments: 8 }),
    ];
    return kit.finish(parts);
  },
};
