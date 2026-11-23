import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A little wooden table (top 0.5) carrying a teal baby scale with a soft pink pad, a pillow, and a round
// dial on the +x side whose face is colour marks and a needle (no numbers).
const TOP = 0.5;
const DIAL_MARKS: readonly PaletteColor[] = ['leaf', 'lime', 'sunYellow', 'orange', 'red'];

/** เครื่องชั่งเด็ก: baby scale on a little table with a soft pad. */
export const item: ItemModel = {
  id: 'baby-scale',
  name: 'เครื่องชั่งเด็ก',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.9, 0.05, 0.9], [0, TOP - 0.025, 0], 'wood')];
    for (const x of [-0.37, 0.37]) {
      for (const z of [-0.37, 0.37]) parts.push(kit.box([0.07, TOP - 0.05, 0.07], [x, (TOP - 0.05) / 2, z], 'woodDark'));
    }
    parts.push(
      kit.box([0.8, 0.09, 0.62], [0, TOP + 0.045, 0], 'teal'),
      kit.box([0.5, 0.05, 0.5], [-0.12, TOP + 0.115, 0], 'pink'), // soft pad
      kit.box([0.5, 0.025, 0.54], [-0.12, TOP + 0.09, 0], 'purple'), // pad rim
      kit.sphere(0.11, [-0.3, TOP + 0.17, 0], 'sunYellow', { scale: [1.0, 0.5, 1.5] }), // little pillow
      // dial console at the +x end, tilted up, with a round face
      kit.box([0.14, 0.18, 0.4], [0.3, TOP + 0.18, 0], 'blue'),
      kit.cylinder(0.13, 0.13, 0.025, [0.38, TOP + 0.2, 0], 'white', { segments: 12, rotate: [0, 0, Math.PI / 2] }),
    );
    DIAL_MARKS.forEach((c, i) => {
      const a = Math.PI * (0.15 + (i / (DIAL_MARKS.length - 1)) * 0.7); // along the top arc
      parts.push(kit.box([0.02, 0.035, 0.035], [0.395, TOP + 0.2 + 0.1 * Math.sin(a), 0.1 * Math.cos(a)], c));
    });
    parts.push(
      kit.box([0.02, 0.1, 0.02], [0.4, TOP + 0.24, 0.025], 'red', { rotate: [-0.4, 0, 0] }), // needle
      kit.sphere(0.02, [0.4, TOP + 0.2, 0], 'charcoal', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
