import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A market stall (1×2, long side along z, front on +x): four posts, a canvas roof, a rail of rippling shirts,
// folded clothes on a table below and a string of warm bulbs.
const POST = { x: 0.34, z: 0.8, top: 1.2 };
const RAIL_Y = 0.98;
const SHIRT = { w: 0.36, h: 0.3, n: 4 }; // 4 vertical strips across each shirt (sleeves are the outer two)
const SHIRTS: Array<{ z: number; color: PaletteColor }> = [
  { z: -0.55, color: 'pink' },
  { z: -0.15, color: 'skyBlue' },
  { z: 0.25, color: 'sunYellow' },
  { z: 0.62, color: 'lime' },
];

/** แผงเสื้อผ้าแขวนราว: a market stall with shirts on a rail (rippling) and a glowing bulb. */
export const item: ItemModel = {
  id: 'clothes-stall',
  name: 'แผงเสื้อผ้าแขวนราว',
  category: 'building',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.9, 0.03, 1.8], [0, 0.015, 0], 'stone'),
      // roof on posts, tilted a little towards +x like an awning
      kit.box([0.7, 0.05, 1.7], [-0.08, POST.top + 0.02, 0], 'blue', { rotate: [0, 0, 0.12] }),
      kit.box([0.04, 0.1, 1.7], [0.26, POST.top - 0.06, 0], 'white'),
      // rail with the clothes hanging, and a low table with folded stacks at the back
      kit.box([0.04, 0.04, 1.6], [0.32, RAIL_Y, 0], 'chrome'),
      kit.box([0.3, 0.3, 1.5], [-0.28, 0.18, 0], 'woodDark'),
      kit.box([0.34, 0.03, 1.54], [-0.28, 0.345, 0], 'wood'),
    ];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push(kit.box([0.04, POST.top - 0.03, 0.04], [sx * POST.x, (POST.top + 0.03) / 2, sz * POST.z], 'woodDark'));
    // folded clothes on the table
    const stacks: PaletteColor[] = ['red', 'white', 'purple', 'orange', 'mint', 'pink'];
    stacks.forEach((c, i) => parts.push(kit.box([0.22, 0.07, 0.2], [-0.28, 0.395, -0.6 + i * 0.24], c)));
    // shirts: every strip of a shirt shares one pivot at its -z edge and the +z axis, so it ripples in one piece
    for (const { z, color } of SHIRTS) {
      const wave: MotionOpts = { kind: 'wave', pivot: [0.34, RAIL_Y, z - SHIRT.w / 2], axis: [0, 0, 1], amount: 0.12 };
      const strip = SHIRT.w / SHIRT.n;
      for (let i = 0; i < SHIRT.n; i++) {
        const sleeve = i === 0 || i === SHIRT.n - 1;
        const h = sleeve ? SHIRT.h * 0.4 : SHIRT.h;
        parts.push(kit.box([0.025, h, strip], [0.35, RAIL_Y - 0.02 - h / 2, z - SHIRT.w / 2 + strip * (i + 0.5)], color, { motion: wave }));
      }
    }
    // string of bulbs along the front edge of the roof
    for (let i = 0; i < 5; i++) {
      parts.push(kit.sphere(0.06, [POST.x + 0.02, POST.top + 0.03, -0.7 + i * 0.35], (['orange', 'pink', 'sunYellow'] as const)[i % 3], { detail: 0, glow: true, light: 'chase', chase: { index: i, count: 5 } }));
    }
    parts.push(kit.box([0.012, 0.012, 1.5], [POST.x + 0.02, POST.top - 0.01, 0], 'charcoal'));
    return kit.finish(parts);
  },
};
