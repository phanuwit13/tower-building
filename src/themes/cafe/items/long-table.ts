import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A long family table running along z, a red runner with a row of six small plants, and three chairs
// on each long side (the +x side is the front).
const TOP = { w: 0.8, l: 2.6, t: 0.06, y: 0.5 }; // top surface at y 0.50
const LEG = { s: 0.06, x: 0.32, z: 1.18 };
const CHAIR = { s: 0.36, seatY: 0.31, x: 0.62, backTop: 0.62 };
const PLANT_Z = [-1.0, -0.6, -0.2, 0.2, 0.6, 1.0];
const POTS: PaletteColor[] = ['terracotta', 'white', 'teal', 'sunYellow', 'pink', 'skyBlue'];
const LEAVES: PaletteColor[] = ['leaf', 'lime', 'leafDark', 'mint', 'leaf', 'lime'];
const BLOOMS: (PaletteColor | null)[] = ['pink', null, 'sunYellow', 'red', null, 'purple'];
const CHAIR_COLORS: PaletteColor[] = ['red', 'teal', 'sunYellow'];

/** โต๊ะยาวสำหรับครอบครัว: a long table with six chairs and a row of small plants. */
export const item: ItemModel = {
  id: 'long-table',
  name: 'โต๊ะยาวสำหรับครอบครัว',
  category: 'seating',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([TOP.w, TOP.t, TOP.l], [0, TOP.y - TOP.t / 2, 0], 'wood'),
      kit.box([0.3, 0.012, 2.5], [0, TOP.y + 0.006, 0], 'red'), // runner
    ];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        parts.push(kit.box([LEG.s, TOP.y - TOP.t, LEG.s], [sx * LEG.x, (TOP.y - TOP.t) / 2, sz * LEG.z], 'woodDark'));
      }
    }
    PLANT_Z.forEach((z, i) => {
      parts.push(
        kit.cylinder(0.065, 0.05, 0.08, [0, TOP.y + 0.012 + 0.04, z], POTS[i], { segments: 8 }),
        kit.sphere(0.075, [0, TOP.y + 0.012 + 0.12, z], LEAVES[i], { detail: 0 }),
      );
      const bloom = BLOOMS[i];
      if (bloom) parts.push(kit.sphere(0.04, [0.02, TOP.y + 0.012 + 0.19, z + 0.01], bloom, { detail: 0 }));
    });
    // six chairs: seat, cushion, four legs and a backrest on the outer side
    let n = 0;
    for (const side of [-1, 1]) {
      for (const z of [-0.8, 0, 0.8]) {
        const c = CHAIR_COLORS[(n++) % 3];
        const cx = side * CHAIR.x;
        const half = CHAIR.s / 2 - 0.025;
        parts.push(
          kit.box([CHAIR.s, 0.05, CHAIR.s], [cx, CHAIR.seatY - 0.025, z], 'woodDark'),
          kit.box([CHAIR.s - 0.08, 0.025, CHAIR.s - 0.08], [cx, CHAIR.seatY + 0.0125, z], c),
          kit.box([0.035, CHAIR.backTop - CHAIR.seatY, CHAIR.s], [cx + side * (CHAIR.s / 2 - 0.0175), (CHAIR.seatY + CHAIR.backTop) / 2, z], c),
        );
        for (const lx of [-1, 1]) {
          for (const lz of [-1, 1]) parts.push(kit.box([0.035, CHAIR.seatY - 0.05, 0.035], [cx + lx * half, (CHAIR.seatY - 0.05) / 2, z + lz * half], 'woodDark'));
        }
      }
    }
    return kit.finish(parts);
  },
};
