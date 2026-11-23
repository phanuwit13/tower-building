import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { aim } from '../../../models/parts';

// An abstract kinetic sculpture (1x1, no figure): a round stone base and a navy pole carry a spinning crown
// (ONE pivot at the pole top): four slim arms with bright cups at their ends and two crossing arches above.
const PIVOT_Y = 1.0;
const SPIN: MotionOpts = { kind: 'spin', pivot: [0, PIVOT_Y, 0], speed: 0.4 };
const ARM = 0.33; // cup centre distance; with the cup radius 0.15 the crown stays within 0.48 of the pole
const CUP = 0.15;
const ARCH = 0.3;
const CUPS: PaletteColor[] = ['red', 'sunYellow', 'blue', 'leaf'];

/** ประติมากรรมกังหัน: an abstract sculpture with colourful cups and arcs that spin slowly. */
export const item: ItemModel = {
  id: 'kinetic-sculpture',
  name: 'ประติมากรรมกังหัน',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.4, 0.44, 0.1, [0, 0.05, 0], 'stone', { segments: 16 }),
      kit.cylinder(0.2, 0.3, 0.12, [0, 0.16, 0], 'orange', { segments: 12 }),
      kit.cylinder(0.06, 0.07, PIVOT_Y - 0.22, [0, (PIVOT_Y + 0.22) / 2, 0], 'navy', { segments: 8 }),
      // the spinning crown: hub, four arms with cups, two crossing arches, a finial
      kit.sphere(0.1, [0, PIVOT_Y, 0], 'sunYellow', { motion: SPIN }),
    ];
    CUPS.forEach((color, i) => {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const dx = Math.cos(a);
      const dz = -Math.sin(a);
      parts.push(
        kit.cylinder(0.03, 0.03, ARM, [dx * ARM / 2, PIVOT_Y, dz * ARM / 2], 'chrome', { segments: 6, rotate: aim([dx, 0, dz]), motion: SPIN }),
        kit.cylinder(CUP, 0.07, 0.2, [dx * ARM, PIVOT_Y + 0.04, dz * ARM], color, { segments: 8, motion: SPIN }),
        kit.cylinder(CUP - 0.03, CUP - 0.03, 0.012, [dx * ARM, PIVOT_Y + 0.14, dz * ARM], 'white', { segments: 8, motion: SPIN }),
      );
    });
    for (const yaw of [0, Math.PI / 2]) {
      parts.push(kit.torus(ARCH, 0.04, [0, PIVOT_Y, 0], yaw === 0 ? 'pink' : 'purple', { radialSegments: 4, tubularSegments: 12, arc: Math.PI, rotate: [0, yaw, 0], motion: SPIN }));
    }
    parts.push(kit.sphere(0.08, [0, PIVOT_Y + ARCH + 0.02, 0], 'sunYellow', { detail: 0, motion: SPIN }));
    return kit.finish(parts);
  },
};
