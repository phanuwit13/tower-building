import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { aim } from '../../../models/parts';

// An abstract kinetic sculpture (1x1, no figure): a round stone base and a navy pole carry a spinning crown
// (ONE pivot at the pole top): four slim arms with bright cups at their ends and two crossing arches above.
const PIVOT_Y = 1.05;
const SPIN: MotionOpts = { kind: 'spin', pivot: [0, PIVOT_Y, 0], speed: 0.4 };
const ARM = 0.34;
const CUPS: PaletteColor[] = ['red', 'sunYellow', 'blue', 'leaf'];

/** ประติมากรรมกังหัน: an abstract sculpture with colourful cups and arcs that spin slowly. */
export const item: ItemModel = {
  id: 'kinetic-sculpture',
  name: 'ประติมากรรมกังหัน',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.36, 0.4, 0.1, [0, 0.05, 0], 'stone', { segments: 16 }),
      kit.cylinder(0.2, 0.26, 0.08, [0, 0.14, 0], 'stoneDark', { segments: 12 }),
      kit.cylinder(0.04, 0.05, PIVOT_Y - 0.18, [0, (PIVOT_Y + 0.18) / 2, 0], 'navy', { segments: 8 }),
      // the spinning crown: hub, four arms with cups, two crossing arches, a finial
      kit.sphere(0.08, [0, PIVOT_Y, 0], 'sunYellow', { motion: SPIN }),
    ];
    CUPS.forEach((color, i) => {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const dx = Math.cos(a);
      const dz = -Math.sin(a);
      parts.push(
        kit.cylinder(0.02, 0.02, ARM, [dx * ARM / 2, PIVOT_Y, dz * ARM / 2], 'chrome', { segments: 6, rotate: aim([dx, 0, dz]), motion: SPIN }),
        kit.cylinder(0.1, 0.045, 0.13, [dx * ARM, PIVOT_Y + 0.02, dz * ARM], color, { segments: 8, motion: SPIN }),
        kit.cylinder(0.075, 0.075, 0.012, [dx * ARM, PIVOT_Y + 0.088, dz * ARM], 'white', { segments: 8, motion: SPIN }),
      );
    });
    for (const yaw of [0, Math.PI / 2]) {
      parts.push(kit.torus(0.22, 0.026, [0, PIVOT_Y, 0], yaw === 0 ? 'pink' : 'purple', { radialSegments: 4, tubularSegments: 8, arc: Math.PI, rotate: [0, yaw, 0], motion: SPIN }));
    }
    parts.push(kit.sphere(0.05, [0, PIVOT_Y + 0.24, 0], 'sunYellow', { detail: 0, motion: SPIN }));
    return kit.finish(parts);
  },
};
