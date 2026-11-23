import type { ItemModel } from '../../../models/contract';
import { ICO_LOW } from '../../../models/parts';
import type { PaletteColor } from '../../../models/palette';
import type { Part } from '../../../models/kit';

// A small crater: a clear raised rim of alternating light and dark stones round a dark floor,
// a few pebbles and a little bright crystal in the middle.
const R = 0.32;
const TUBE = 0.07; // rim is 0.14 high
const FLOOR_TOP = 0.03;
const RIM_STONES = 10;

/** หลุมเล็ก: a small crater with a little rim. */
export const item: ItemModel = {
  id: 'small-crater',
  name: 'หลุมเล็ก',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.torus(R, TUBE, [0, TUBE, 0], 'stoneDark', { radialSegments: 5, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(R, R, FLOOR_TOP, [0, FLOOR_TOP / 2, 0], 'charcoal', { segments: 12 }),
    ];
    // rim stones, alternating pale and lilac/dark, a little bigger than the rim tube
    const tones: PaletteColor[] = ['stone', 'charcoal', 'purple', 'stoneDark'];
    for (let i = 0; i < RIM_STONES; i++) {
      const a = (i / RIM_STONES) * Math.PI * 2;
      const r = i % 2 ? 0.065 : 0.08;
      parts.push(kit.sphere(r, [R * Math.cos(a), 0.1 + r * 0.5, -R * Math.sin(a)], tones[i % tones.length], { detail: 0, scale: [1, 0.8, 1], rotate: [0, a * 3, 0] }));
    }
    // pebbles on the floor
    for (const [x, z, r] of [[-0.14, 0.1, 0.04], [0.15, 0.12, 0.035], [0.12, -0.15, 0.04]] as const) {
      parts.push(kit.sphere(r, [x, FLOOR_TOP + r * 0.8 * ICO_LOW, z], 'stone', { detail: 0, scale: [1, 0.8, 1] }));
    }
    // a small bright crystal in the middle
    parts.push(kit.cone(0.065, 0.2, [0, FLOOR_TOP + 0.1, 0], 'mint', { segments: 5 }));
    parts.push(kit.cone(0.04, 0.12, [0.07, FLOOR_TOP + 0.06, -0.03], 'skyBlue', { segments: 5, rotate: [0, 0, -0.3] }));
    return kit.finish(parts);
  },
};
