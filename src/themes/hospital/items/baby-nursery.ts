import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// Four empty baby cots in two rows (cot top 0.55) round one post; a toy mobile turns above them from the post top.
// Every part of the mobile (hub, arms, strings, toys) shares ONE spin about the post, so it turns as a piece.
// The toys hang at y >= 1.0, well above the cot rails (0.85), so nothing it turns past is ever touched.
const COT = { x: 0.84, z: 0.82, base: 0.43, mattressTop: 0.55, rail: 0.85 }; // length along x, width along z
const CENTRES: Array<[number, number, PaletteColor, PaletteColor, PaletteColor]> = [
  // x, z, blanket, blanket stripe, cot frame colour
  [0.5, 0.5, 'pink', 'white', 'sand'],
  [0.5, -0.5, 'mint', 'sunYellow', 'sand'],
  [-0.5, 0.5, 'skyBlue', 'pink', 'sand'],
  [-0.5, -0.5, 'lampWarm', 'mint', 'sand'],
];
const HUB_Y = 1.45;
const SPIN: MotionOpts = { kind: 'spin', pivot: [0, HUB_Y, 0], speed: 0.4 };
const ARM_R = 0.7; // the arms run along the diagonals, towards the cot centres

/** ห้องเด็กแรกเกิด: a row of empty baby cots with pastel blankets under a turning toy mobile. */
export const item: ItemModel = {
  id: 'baby-nursery',
  name: 'ห้องเด็กแรกเกิด',
  category: 'seating',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const [cx, cz, blanket, stripe, frame] of CENTRES) {
      const L = COT.x;
      const W = COT.z;
      const at = (x: number, y: number, z: number): Vec3 => [cx + x, y, cz + z];
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) parts.push(kit.box([0.05, COT.rail, 0.05], at(sx * (L / 2 - 0.025), COT.rail / 2, sz * (W / 2 - 0.025)), frame)); // corner posts
      }
      parts.push(
        kit.box([L, 0.04, W], at(0, COT.base + 0.02, 0), frame), // base board
        kit.box([L - 0.1, 0.08, W - 0.1], at(0, COT.mattressTop - 0.04, 0), 'glassBlue'), // mattress
        kit.box([0.28, 0.05, W - 0.24], at(-0.23, COT.mattressTop + 0.025, 0), 'cream'), // pillow at the -x (head) end
        kit.box([0.44, 0.04, W - 0.16], at(0.15, COT.mattressTop + 0.02, 0), blanket), // blanket over the foot
        kit.box([0.1, 0.045, W - 0.14], at(-0.02, COT.mattressTop + 0.0225, 0), stripe), // turned-down edge of the blanket
        kit.box([0.05, 0.34, W - 0.1], at(L / 2 - 0.025, COT.rail - 0.17, 0), frame), // head and foot panels
        kit.box([0.05, 0.34, W - 0.1], at(-L / 2 + 0.025, COT.rail - 0.17, 0), frame),
      );
      // side rails: a top rail and slats facing +z/-z
      for (const sz of [-1, 1]) {
        parts.push(kit.box([L, 0.04, 0.04], at(0, COT.rail - 0.02, sz * (W / 2 - 0.02)), frame));
        for (let i = 0; i < 5; i++) parts.push(kit.box([0.025, 0.3, 0.025], at(-0.27 + i * 0.135, COT.rail - 0.19, sz * (W / 2 - 0.02)), frame));
      }
    }
    // the post
    parts.push(
      kit.cylinder(0.07, 0.07, 0.03, [0, 0.015, 0], 'orange', { segments: 8 }),
      kit.cylinder(0.035, 0.035, HUB_Y - 0.03, [0, (HUB_Y - 0.03) / 2 + 0.03, 0], 'sunYellow', { segments: 8 }),
    );
    // the mobile: hub, two crossing arms along the diagonals, four strings, four toys
    parts.push(
      kit.sphere(0.06, [0, HUB_Y, 0], 'orange', { detail: 0, motion: SPIN }),
      kit.box([2 * ARM_R, 0.03, 0.03], [0, HUB_Y, 0], 'blue', { rotate: [0, Math.PI / 4, 0], motion: SPIN }),
      kit.box([2 * ARM_R, 0.03, 0.03], [0, HUB_Y, 0], 'blue', { rotate: [0, -Math.PI / 4, 0], motion: SPIN }),
    );
    const toyY = 1.12;
    const dirs: Array<[number, number]> = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    dirs.forEach(([sx, sz], i) => {
      const x = (sx * ARM_R) / Math.SQRT2;
      const z = (sz * ARM_R) / Math.SQRT2;
      const p: Vec3 = [x, toyY, z];
      parts.push(kit.cylinder(0.012, 0.012, HUB_Y - toyY - 0.02, [x, (HUB_Y + toyY) / 2 + 0.02 / 2, z], 'stoneDark', { segments: 4, motion: SPIN })); // string
      if (i === 0) parts.push(kit.sphere(0.075, p, 'red', { motion: SPIN })); // ball
      if (i === 1) parts.push(kit.cone(0.07, 0.09, [x, toyY + 0.045, z], 'sunYellow', { segments: 6, motion: SPIN }), kit.cone(0.07, 0.09, [x, toyY - 0.045, z], 'sunYellow', { segments: 6, rotate: [Math.PI, 0, 0], motion: SPIN })); // star
      if (i === 2) parts.push(kit.sphere(0.06, [x, toyY, z], 'glassBlue', { detail: 0, scale: [1, 0.8, 1.3], motion: SPIN }), kit.sphere(0.05, [x, toyY + 0.035, z + 0.06], 'glassBlue', { detail: 0, motion: SPIN })); // cloud
      if (i === 3) parts.push(kit.cylinder(0.08, 0.08, 0.03, p, 'purple', { segments: 10, rotate: [0, 0, Math.PI / 2], motion: SPIN })); // moon disc
    });
    return kit.finish(parts);
  },
};
