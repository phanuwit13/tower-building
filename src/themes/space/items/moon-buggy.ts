import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { aim, rod, wheel } from '../../../models/parts';

const WHEEL = { r: 0.2, tube: 0.06, x: 0.4, zs: [-0.62, 0.62] }; // big mesh wheels
const FLOOR_Y = 0.3;

/** รถบักกี้: an open moon buggy with big mesh wheels and a dish; the seats are empty. */
export const item: ItemModel = {
  id: 'moon-buggy',
  name: 'รถบักกี้',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.5, 0.06, 1.5], [0, FLOOR_Y, 0], 'orange'), // the open floor
      kit.box([0.14, 0.12, 1.5], [0, FLOOR_Y - 0.07, 0], 'charcoal'), // frame keel
      kit.box([0.5, 0.12, 0.3], [0, FLOOR_Y + 0.05, 0.72], 'orange'), // front hood
      kit.box([0.5, 0.12, 0.3], [0, FLOOR_Y + 0.05, -0.72], 'orange'), // back deck
    ];
    for (const s of [-1, 1]) {
      for (const z of WHEEL.zs) {
        const x = s * WHEEL.x;
        parts.push(
          ...wheel(kit, { at: [x, WHEEL.r + WHEEL.tube, z], radius: WHEEL.r, tube: WHEEL.tube, axis: 'x', color: 'charcoal', hubColor: 'sunYellow', hubRadius: 0.07, hubLength: 0.12, spokes: 2, spokeColor: 'stone', tubularSegments: 12 }),
          rod(kit, [s * 0.22, FLOOR_Y - 0.05, z], [x, WHEEL.r + WHEEL.tube, z], 0.025, 'stoneDark', { segments: 4 }),
        );
      }
    }
    // two empty seats and a steering wheel
    for (const z of [-0.12, -0.5]) {
      parts.push(
        kit.box([0.36, 0.08, 0.26], [0, FLOOR_Y + 0.07, z], 'blue'),
        kit.box([0.36, 0.22, 0.06], [0, FLOOR_Y + 0.2, z - 0.13], 'blue'),
      );
    }
    parts.push(
      kit.cylinder(0.02, 0.02, 0.26, [0, FLOOR_Y + 0.2, 0.42], 'charcoal', { segments: 6, rotate: [-0.5, 0, 0] }),
      kit.torus(0.08, 0.02, [0, FLOOR_Y + 0.33, 0.35], 'charcoal', { rotate: [Math.PI / 2 - 0.5, 0, 0], radialSegments: 4, tubularSegments: 12 }),
    );
    // yellow roll bars
    for (const s of [-1, 1]) {
      parts.push(
        rod(kit, [s * 0.22, FLOOR_Y + 0.03, -0.62], [s * 0.22, 0.68, -0.62], 0.025, 'sunYellow', { segments: 6 }),
        rod(kit, [s * 0.22, 0.68, -0.62], [s * 0.22, 0.68, 0.0], 0.025, 'sunYellow', { segments: 6 }),
        rod(kit, [s * 0.22, 0.68, 0.0], [s * 0.22, FLOOR_Y + 0.03, 0.0], 0.025, 'sunYellow', { segments: 6 }),
      );
    }
    // dish on a mast at the back: a squashed dome tipped toward the sky, with a feed horn
    const dishAt: [number, number, number] = [0, 0.5, -0.78];
    parts.push(
      kit.cylinder(0.025, 0.03, 0.22, [0, 0.4, -0.78], 'stoneDark', { segments: 6 }),
      kit.dome(0.2, dishAt, 'white', { segments: 8, scale: [1, 0.45, 1], rotate: [Math.PI + 0.5, 0, 0] }),
    );
    parts.push(kit.cylinder(0.012, 0.012, 0.16, [0, 0.59, -0.73], 'red', { segments: 4, rotate: aim([0, 0.88, 0.48]) }));
    return kit.finish(parts);
  },
};
