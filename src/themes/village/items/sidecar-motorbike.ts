import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod, wheel } from '../../../models/parts';

// A small red motorbike (heading +z) with a teal sidecar on its +x side, full of baskets of
// fruit and vegetables. Still.
const BIKE_X = -0.15;
const R = 0.2;
const T = 0.07;
const SIDE_X = 0.3;

/** มอเตอร์ไซค์พ่วงข้าง: a small motorbike with a sidecar full of baskets. */
export const item: ItemModel = {
  id: 'sidecar-motorbike',
  name: 'มอเตอร์ไซค์พ่วงข้าง',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    // bike: chunky wheels, a big red tank and body, a clear brown seat, a windshield and headlight
    for (const z of [-0.62, 0.62]) {
      parts.push(...wheel(kit, { at: [BIKE_X, R + T, z], radius: R, tube: T, axis: 'x', color: 'charcoal', hubColor: 'sunYellow', hubRadius: 0.07, hubLength: 0.16, tubularSegments: 12 }));
    }
    parts.push(
      kit.box([0.2, 0.16, 0.7], [BIKE_X, 0.36, 0], 'stoneDark'),
      kit.box([0.22, 0.2, 0.34], [BIKE_X, 0.52, 0.18], 'red'),
      kit.sphere(0.13, [BIKE_X, 0.58, 0.2], 'red', { detail: 0, scale: [0.85, 0.8, 1.2] }),
      kit.box([0.2, 0.08, 0.4], [BIKE_X, 0.56, -0.24], 'woodDark'),
      kit.box([0.22, 0.06, 0.2], [BIKE_X, 0.46, -0.52], 'red'),
      rod(kit, [BIKE_X, 0.3, 0.6], [BIKE_X, 0.7, 0.46], 0.03, 'chrome', { segments: 6 }),
      kit.box([0.4, 0.05, 0.05], [BIKE_X, 0.72, 0.46], 'charcoal'),
      kit.box([0.28, 0.2, 0.03], [BIKE_X, 0.84, 0.44], 'glassBlue', { rotate: [-0.3, 0, 0] }),
      kit.sphere(0.07, [BIKE_X, 0.62, 0.58], 'lampWarm', { detail: 0 }),
      kit.box([0.22, 0.04, 0.24], [BIKE_X, 0.46, 0.62], 'red'),
    );
    // sidecar: wheel, tub, bumper, baskets of goods
    parts.push(...wheel(kit, { at: [SIDE_X, 0.18, -0.1], radius: 0.14, tube: 0.04, axis: 'x', color: 'charcoal', hubColor: 'stone', hubRadius: 0.04, hubLength: 0.1, tubularSegments: 12 }));
    parts.push(
      kit.box([0.34, 0.2, 0.62], [SIDE_X, 0.38, -0.1], 'teal'),
      kit.wedge([0.34, 0.16, 0.26], [SIDE_X, 0.36, 0.34], 'teal', { rotate: [0, Math.PI / 2, 0] }),
      kit.box([0.36, 0.04, 0.64], [SIDE_X, 0.49, -0.1], 'white'),
      rod(kit, [BIKE_X + 0.07, 0.3, -0.3], [SIDE_X - 0.15, 0.34, -0.3], 0.02, 'chrome', { segments: 6 }),
      rod(kit, [BIKE_X + 0.07, 0.3, 0.1], [SIDE_X - 0.15, 0.34, 0.1], 0.02, 'chrome', { segments: 6 }),
    );
    const goods = [['orange', 'sunYellow', 'orange'], ['leaf', 'lime', 'leaf'], ['red', 'pink', 'red']] as const;
    goods.forEach((fill, i) => {
      const z = -0.3 + i * 0.2;
      parts.push(kit.cylinder(0.09, 0.075, 0.12, [SIDE_X, 0.57, z], 'sand', { segments: 8 }));
      fill.forEach((c, j) => {
        const a = (j / 3) * Math.PI * 2;
        parts.push(kit.sphere(0.055, [SIDE_X + 0.04 * Math.cos(a), 0.66, z + 0.04 * Math.sin(a)], c, { detail: 0 }));
      });
    });
    return kit.finish(parts);
  },
};
