import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// 2 wide (x) by 3 long (z). A paved walk runs along z under a rose arch, with a rose bed on each side.
const BED_X = 0.66; // bed centre x
const BED = { w: 0.6, d: 2.8, h: 0.12 };
const SOIL_Y = BED.h; // soil line: the sway pivot
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, SOIL_Y, 0], amount: 0.14 };
const ARCH_R = 0.36;
const ARCH_Y = 0.52; // where the arch ring springs from
const BLOOMS: PaletteColor[] = ['red', 'pink', 'sunYellow', 'red', 'pink', 'sunYellow'];

/** สวนกุหลาบ: two beds of red, pink and yellow roses either side of a paved walk and a rose arch; the roses sway. */
export const item: ItemModel = {
  id: 'rose-garden',
  name: 'สวนกุหลาบ',
  category: 'nature',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.96, 0.04, 2.96], [0, 0.02, 0], 'lime'),
      kit.box([0.62, 0.05, 2.9], [0, 0.045, 0], 'stone'),
    ];
    let n = 0;
    for (const s of [-1, 1]) {
      const x = s * BED_X;
      parts.push(
        kit.box([BED.w, BED.h, BED.d], [x, BED.h / 2, 0], 'stoneDark'),
        kit.box([BED.w - 0.1, 0.03, BED.d - 0.1], [x, BED.h + 0.005, 0], 'bark'),
      );
      for (const z of [-1.05, -0.5, 0.5, 1.05]) {
        const bx = x + (n % 2 ? 0.05 : -0.05);
        const by = SOIL_Y + 0.16;
        parts.push(kit.sphere(0.17, [bx, by, z], 'leaf', { detail: 0, scale: [1, 0.9, 1], motion: SWAY }));
        // three blooms on top of each bush
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * Math.PI * 2 + n;
          parts.push(
            kit.sphere(0.065, [bx + Math.cos(a) * 0.1, by + 0.1 + (k === 0 ? 0.04 : 0), z + Math.sin(a) * 0.1], BLOOMS[(n + k) % BLOOMS.length], {
              detail: 0,
              motion: SWAY,
            }),
          );
        }
        n++;
      }
      // a middle row of low pink and yellow roses
      for (const z of [0, -0.78, 0.78]) {
        parts.push(
          kit.sphere(0.1, [x + s * 0.17, SOIL_Y + 0.08, z], 'leafDark', { detail: 0, motion: SWAY }),
          kit.sphere(0.06, [x + s * 0.17, SOIL_Y + 0.17, z], z === 0 ? 'orange' : 'pink', { detail: 0, motion: SWAY }),
        );
      }
    }
    // the arch: two white posts, a half ring over the walk, roses on it
    for (const s of [-1, 1]) {
      parts.push(kit.cylinder(0.04, 0.04, ARCH_Y - 0.05, [s * ARCH_R, 0.05 + (ARCH_Y - 0.05) / 2, 0], 'white', { segments: 8 }));
    }
    parts.push(kit.torus(ARCH_R, 0.035, [0, ARCH_Y, 0], 'white', { arc: Math.PI, radialSegments: 5, tubularSegments: 12 }));
    for (const [a, c] of [[0.25, 'red'], [0.7, 'pink'], [1.2, 'sunYellow'], [1.9, 'red'], [2.45, 'pink'], [2.9, 'sunYellow']] as const) {
      parts.push(kit.sphere(0.06, [Math.cos(a) * ARCH_R, ARCH_Y + Math.sin(a) * ARCH_R, 0.03 * (a > 1.5 ? -1 : 1)], c, { detail: 0 }));
      parts.push(kit.sphere(0.045, [Math.cos(a + 0.3) * ARCH_R, ARCH_Y + Math.sin(a + 0.3) * ARCH_R + 0.01, -0.04], 'leaf', { detail: 0 }));
    }
    return kit.finish(parts);
  },
};
