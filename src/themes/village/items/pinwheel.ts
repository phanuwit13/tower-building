import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A bamboo pole with a four-bladed wheel facing +x. The hub axis runs along x; the wheel spins about it (one pivot, one phase).
const POLE_H = 1.9;
const HUB = { x: 0.12, y: POLE_H };
const BLADE = { len: 0.32, wide: 0.17, gap: 0.04 };
const SPIN: MotionOpts = { kind: 'spin', pivot: [HUB.x, HUB.y, 0], axis: [1, 0, 0], speed: 0.4 };
const BLADE_COLOURS: PaletteColor[] = ['red', 'sunYellow', 'blue', 'orange'];

/** กังหันลมไม้ไผ่: a bamboo pinwheel on a tall pole. */
export const item: ItemModel = {
  id: 'pinwheel',
  name: 'กังหันลมไม้ไผ่',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.2, 0.26, 0.05, [0, 0.025, 0], 'stoneDark', { segments: 10 }), // stone footing
      kit.cylinder(0.04, 0.045, POLE_H, [0, POLE_H / 2 + 0.05 - 0.05, 0], 'lime', { segments: 8 }),
      kit.cylinder(0.02, 0.02, HUB.x, [HUB.x / 2, HUB.y, 0], 'woodDark', { segments: 6, rotate: [0, 0, Math.PI / 2] }), // axle
    ];
    // bamboo nodes
    for (const y of [0.35, 0.8, 1.25, 1.7]) parts.push(kit.cylinder(0.055, 0.055, 0.035, [0, y, 0], 'leafDark', { segments: 8 }));
    parts.push(kit.sphere(0.065, [HUB.x, HUB.y, 0], 'sunYellow', { detail: 1, motion: SPIN }));
    BLADE_COLOURS.forEach((c, i) => {
      const a = (i / BLADE_COLOURS.length) * Math.PI * 2;
      const mid = BLADE.gap + BLADE.len / 2;
      const at: [number, number, number] = [HUB.x + 0.02, HUB.y + mid * Math.cos(a), mid * Math.sin(a)];
      parts.push(
        kit.box([0.025, BLADE.len, BLADE.wide], at, c, { rotate: [a, 0.35, 0], motion: SPIN }),
        // a darker edge strip along one side of the blade
        kit.box([0.03, BLADE.len, 0.03], [at[0], HUB.y + mid * Math.cos(a) + 0.07 * -Math.sin(a), mid * Math.sin(a) + 0.07 * Math.cos(a)], 'white', { rotate: [a, 0.35, 0], motion: SPIN }),
      );
    });
    return kit.finish(parts);
  },
};
