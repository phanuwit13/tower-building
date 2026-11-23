import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A wire shopping trolley (1×1, front +x) on four little wheels, with a few bags in the basket.
const BASKET = { x: 0.05, w: 0.7, d: 0.46, y0: 0.2, y1: 0.5 };
const BAGS = [
  { x: 0.2, z: -0.08, w: 0.16, h: 0.22, d: 0.14, color: 'red' },
  { x: 0.02, z: 0.1, w: 0.16, h: 0.28, d: 0.14, color: 'leaf' },
  { x: -0.12, z: -0.1, w: 0.16, h: 0.2, d: 0.14, color: 'sunYellow' },
] as const;

/** รถเข็นช้อปปิ้ง: a shopping trolley with a few bags. */
export const item: ItemModel = {
  id: 'shopping-trolley',
  name: 'รถเข็นช้อปปิ้ง',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const { x, w, d, y0, y1 } = BASKET;
    const x0 = x - w / 2;
    const x1 = x + w / 2;
    const zh = d / 2;
    const parts: Part[] = [
      // solid floor and wire sides (a rail at the top and the middle, bars between)
      kit.box([w, 0.03, d], [x, y0 + 0.015, 0], 'chrome'),
    ];
    for (const y of [y1, (y0 + y1) / 2]) {
      parts.push(
        rod(kit, [x0, y, -zh], [x1, y, -zh], 0.012, 'stoneDark', { segments: 4 }),
        rod(kit, [x0, y, zh], [x1, y, zh], 0.012, 'stoneDark', { segments: 4 }),
        rod(kit, [x0, y, -zh], [x0, y, zh], 0.012, 'stoneDark', { segments: 4 }),
        rod(kit, [x1, y, -zh], [x1, y, zh], 0.012, 'stoneDark', { segments: 4 }),
      );
    }
    for (const xx of [x0, x0 + w / 3, x0 + (2 * w) / 3, x1]) {
      parts.push(rod(kit, [xx, y0, -zh], [xx, y1, -zh], 0.012, 'stoneDark', { segments: 4 }), rod(kit, [xx, y0, zh], [xx, y1, zh], 0.012, 'stoneDark', { segments: 4 }));
    }
    for (const zz of [-zh, zh]) {
      parts.push(rod(kit, [x0, y0, zz], [x0, y1, zz], 0.012, 'stoneDark', { segments: 4 }), rod(kit, [x1, y0, zz], [x1, y1, zz], 0.012, 'stoneDark', { segments: 4 }));
    }
    // chassis, handle at the back (-x) and a red grip
    parts.push(
      kit.box([w - 0.1, 0.03, 0.04], [x, 0.14, -0.2], 'charcoal'),
      kit.box([w - 0.1, 0.03, 0.04], [x, 0.14, 0.2], 'charcoal'),
      rod(kit, [x0 + 0.02, y1, -zh], [x0 - 0.1, y1 + 0.18, -0.2], 0.014, 'stoneDark', { segments: 4 }),
      rod(kit, [x0 + 0.02, y1, zh], [x0 - 0.1, y1 + 0.18, 0.2], 0.014, 'stoneDark', { segments: 4 }),
      kit.cylinder(0.025, 0.025, 0.46, [x0 - 0.1, y1 + 0.18, 0], 'red', { segments: 6, rotate: [Math.PI / 2, 0, 0], glow: true, light: 'breathe' }),
      // glowing coin lock on the handle and fairy bulbs on the front rail
      kit.sphere(0.045, [x0 - 0.1, y1 + 0.26, 0], 'sunYellow', { detail: 0, glow: true, light: 'breathe' }),
      kit.sphere(0.035, [x1, y1, -0.15], 'pink', { detail: 0, glow: true, light: 'breathe' }),
      kit.sphere(0.035, [x1, y1, 0], 'lime', { detail: 0, glow: true, light: 'breathe' }),
      kit.sphere(0.035, [x1, y1, 0.15], 'orange', { detail: 0, glow: true, light: 'breathe' }),
    );
    for (const wx of [x0 + 0.08, x1 - 0.08]) {
      for (const wz of [-0.2, 0.2]) {
        parts.push(
          kit.box([0.03, 0.1, 0.03], [wx, 0.19, wz * 0.9], 'charcoal'),
          kit.cylinder(0.05, 0.05, 0.04, [wx, 0.05, wz], 'charcoal', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
        );
      }
    }
    // bags with a small handle each
    for (const b of BAGS) {
      parts.push(
        kit.box([b.w, b.h, b.d], [b.x, y0 + 0.03 + b.h / 2, b.z], b.color),
        kit.torus(0.04, 0.012, [b.x, y0 + 0.03 + b.h, b.z], 'white', { arc: Math.PI, radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0] }),
      );
    }
    return kit.finish(parts);
  },
};
