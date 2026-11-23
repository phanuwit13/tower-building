import type { ItemModel } from '../../../models/contract';
import type { PaletteColor } from '../../../models/palette';
import { streamStrip } from './stream';

// 1×2, running along z like the stream it shares its banks and water with. Round stones to hop along, set in a zigzag.
const STONE_TOP = 0.095; // above the banks' kind of height, clear of the water (0.05)
/** Stones: [x, z, radius, colour]. */
const STONES: Array<[number, number, number, PaletteColor]> = [
  [0.08, 0.78, 0.15, 'stone'], [-0.1, 0.38, 0.14, 'stoneDark'], [0.1, 0.0, 0.16, 'stone'], [-0.08, -0.4, 0.14, 'stone'], [0.07, -0.78, 0.15, 'stoneDark'],
];

/** ทางเดินหินข้ามลำธาร: round stepping stones in a strip of stream. */
export const item: ItemModel = {
  id: 'stepping-stones',
  name: 'ทางเดินหินข้ามลำธาร',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts = streamStrip(kit);
    for (const [x, z, r, c] of STONES) {
      const h = STONE_TOP - 0.03;
      parts.push(
        kit.cylinder(r * 0.92, r, h, [x, 0.03 + h / 2, z], c, { segments: 10 }),
        kit.cylinder(r * 0.6, r * 0.6, 0.012, [x, STONE_TOP + 0.002, z], c === 'stone' ? 'white' : 'stone', { segments: 8 }), // a paler worn patch
      );
    }
    // a few pebbles by the stones, a flower on each bank and a bank stone to step on from
    parts.push(
      kit.sphere(0.04, [-0.2, 0.07, 0.75], 'stone', { detail: 0, scale: [1.3, 0.6, 1] }),
      kit.sphere(0.035, [0.2, 0.07, -0.4], 'stone', { detail: 0, scale: [1.3, 0.6, 1] }),
      kit.cylinder(0.1, 0.11, 0.03, [0.37, 0.095, 0.88], 'stone', { segments: 8 }),
      kit.cylinder(0.012, 0.016, 0.2, [0.42, 0.18, 0.3], 'leaf', { segments: 4 }),
      kit.sphere(0.05, [0.42, 0.3, 0.3], 'pink', { detail: 0 }),
      kit.cylinder(0.012, 0.016, 0.2, [-0.42, 0.18, -0.3], 'leaf', { segments: 4 }),
      kit.sphere(0.05, [-0.42, 0.3, -0.3], 'sunYellow', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
