import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A round base with a tall middle post and three big teacups; every cup (saucer, cup, tea and handle)
// spins about its own centre.
const BASE = { r: 0.95, h: 0.05 };
const CUP_RAD = 0.52;
const SAUCER = { r: 0.32, h: 0.03 };
const CUP = { rTop: 0.27, rBottom: 0.2, h: 0.2, y: BASE.h + SAUCER.h };
const CUPS: { color: PaletteColor; angle: number; speed: number }[] = [
  { color: 'pink', angle: Math.PI / 2, speed: 0.7 },
  { color: 'sunYellow', angle: Math.PI / 2 + (2 * Math.PI) / 3, speed: -0.6 },
  { color: 'mint', angle: Math.PI / 2 + (4 * Math.PI) / 3, speed: 0.8 },
];

/** ถ้วยกาแฟหมุน: three big spinning teacups round a middle post. */
export const item: ItemModel = {
  id: 'teacups',
  name: 'ถ้วยกาแฟหมุน',
  category: 'ride',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(BASE.r, BASE.r, BASE.h, [0, BASE.h / 2, 0], 'teal', { segments: 20 }),
      kit.cylinder(0.12, 0.16, 0.9, [0, BASE.h + 0.45, 0], 'sunYellow', { segments: 8 }),
      kit.cone(0.24, 0.3, [0, BASE.h + 0.9 + 0.15, 0], 'red', { segments: 8 }),
      kit.sphere(0.06, [0, BASE.h + 1.2 + 0.03, 0], 'sunYellow', { detail: 0 }),
    ];
    for (const { color, angle, speed } of CUPS) {
      const cx = CUP_RAD * Math.cos(angle);
      const cz = CUP_RAD * Math.sin(angle);
      const spin: MotionOpts = { kind: 'spin', pivot: [cx, 0, cz], axis: [0, 1, 0], speed };
      const midY = CUP.y + CUP.h / 2;
      parts.push(
        kit.cylinder(SAUCER.r, SAUCER.r, SAUCER.h, [cx, BASE.h + SAUCER.h / 2, cz], 'white', { segments: 12, motion: spin }),
        kit.cylinder(CUP.rTop, CUP.rBottom, CUP.h, [cx, midY, cz], color, { segments: 12, motion: spin }),
        kit.cylinder(0.24, 0.24, 0.04, [cx, CUP.y + 0.1, cz], 'white', { segments: 12, motion: spin }),
        kit.cylinder(0.23, 0.23, 0.015, [cx, CUP.y + CUP.h + 0.0025, cz], 'bark', { segments: 12, motion: spin }),
        kit.torus(0.07, 0.025, [cx + CUP.rTop + 0.02, midY, cz], color, { radialSegments: 4, tubularSegments: 8, motion: spin }),
      );
    }
    return kit.finish(parts);
  },
};
