import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A round sushi counter. The still parts: a wooden base, the diners' counter ring, a cream kitchen island with a
// red roof on four posts and a neon nigiri, and eight stools. The conveyor (belt ring, plates and sushi) all turn on ONE
// spin pivot at the centre, between the island and the counter, so nothing moving touches anything still.
const SPIN: MotionOpts = { kind: 'spin', pivot: [0, 0, 0], axis: [0, 1, 0], speed: 0.4 };
const TOP = 0.62;
const BELT = { r: 0.5, tube: 0.1, y: 0.55 }; // reaches r 0.4..0.6, top at y 0.6
const PLATES = 10;
const PLATE_COLORS: readonly PaletteColor[] = ['red', 'pink', 'sunYellow', 'teal', 'purple', 'orange', 'blue', 'lime', 'mint', 'skyBlue'];
const TOPPING: readonly PaletteColor[] = ['orange', 'pink', 'red', 'sunYellow'];

/** ร้านซูชิสายพาน: a round counter with coloured sushi plates going round, and stools. */
export const item: ItemModel = {
  id: 'sushi-restaurant',
  name: 'ร้านซูชิสายพาน',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      // still: base, kitchen island, roof
      kit.cylinder(0.8, 0.8, 0.45, [0, 0.225, 0], 'woodDark', { segments: 16 }),
      kit.cylinder(0.36, 0.36, TOP, [0, TOP / 2, 0], 'cream', { segments: 12 }),
      kit.cylinder(0.36, 0.36, 0.03, [0, TOP + 0.005, 0], 'white', { segments: 12 }),
      kit.cone(0.42, 0.3, [0, 1.35, 0], 'red', { segments: 8 }),
      kit.cylinder(0.05, 0.05, 0.1, [0, 1.55, 0], 'redDark', { segments: 6 }),
    ];
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      parts.push(kit.cylinder(0.025, 0.025, 0.7, [0.26 * Math.cos(a), TOP + 0.35, -0.26 * Math.sin(a)], 'woodDark', { segments: 6 }));
    }
    // still: the diners' counter ring (16 slabs) and eight stools outside it
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      parts.push(kit.box([0.2, 0.17, 0.3], [0.72 * Math.cos(a), 0.535, -0.72 * Math.sin(a)], k % 2 ? 'wood' : 'sand', { rotate: [0, a, 0] }));
    }
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
      const x = 0.88 * Math.cos(a);
      const z = -0.88 * Math.sin(a);
      parts.push(
        kit.cylinder(0.04, 0.05, 0.27, [x, 0.135, z], 'charcoal', { segments: 6 }),
        kit.cylinder(0.1, 0.1, 0.05, [x, 0.285, z], k % 2 ? 'red' : 'orange', { segments: 8 }),
      );
    }
    // neon nigiri on the roof: rice (still, white) under a glowing salmon slice
    parts.push(
      kit.box([0.3, 0.07, 0.16], [0, 1.64, 0], 'white', { rotate: [0, 0.3, 0] }),
      kit.box([0.34, 0.05, 0.19], [0, 1.7, 0], 'orange', { glow: true, rotate: [0, 0.3, 0] }),
    );
    // moving: belt, plates and sushi, all on the one pivot
    parts.push(kit.torus(BELT.r, BELT.tube, [0, BELT.y, 0], 'charcoal', { radialSegments: 6, tubularSegments: 16, rotate: [Math.PI / 2, 0, 0], scale: [1, 1, 0.5], motion: SPIN }));
    for (let k = 0; k < PLATES; k++) {
      const a = (k / PLATES) * Math.PI * 2;
      const x = BELT.r * Math.cos(a);
      const z = -BELT.r * Math.sin(a);
      parts.push(
        kit.cylinder(0.075, 0.075, 0.02, [x, 0.61, z], PLATE_COLORS[k], { segments: 8, motion: SPIN }),
        kit.box([0.07, 0.04, 0.05], [x, 0.64, z], 'white', { rotate: [0, a, 0], motion: SPIN }),
        kit.box([0.08, 0.02, 0.06], [x, 0.67, z], TOPPING[k % TOPPING.length], { rotate: [0, a, 0], motion: SPIN }),
      );
    }
    return kit.finish(parts);
  },
};
