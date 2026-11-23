import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow } from '../../../models/parts';

// A toy store (2×2, front +x): a yellow shop with a lit display window, a teddy and a rocket on a
// blue shelf out front, toy blocks on the roof and a star neon on a rooftop board.
const BASE_H = 0.04;
const SHOP = { x0: -0.95, x1: 0, z: 0.9, top: 1.05 };
const SHELF = { x0: 0.03, x1: 0.45, h: 0.22, z: 0.75 };
const BOARD = { x: -0.45, y: 1.6, w: 0.9, h: 0.9, d: 0.06 };
const STAR_R = 0.3;

/** ร้านของเล่น: a toy store with a teddy and a rocket on display and a star neon. */
export const item: ItemModel = {
  id: 'toy-store',
  name: 'ร้านของเล่น',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const w = SHOP.x1 - SHOP.x0;
    const cx = (SHOP.x0 + SHOP.x1) / 2;
    const roofY = SHOP.top;
    const parts: Part[] = [
      kit.box([1.9, BASE_H, 1.9], [0, BASE_H / 2, 0], 'stone'),
      kit.box([w, SHOP.top - BASE_H, SHOP.z * 2], [cx, (BASE_H + SHOP.top) / 2, 0], 'sunYellow'),
      kit.box([w, 0.1, SHOP.z * 2 + 0.01], [cx, 0.14, 0], 'orange'),
      kit.box([w + 0.1, 0.08, SHOP.z * 2 + 0.1], [cx, roofY + 0.04, 0], 'blue'),
      // display window behind the shelf
      kit.box([0.04, 0.76, 1.56], [0.02, 0.6, 0], 'white'),
      ...glassWindow(kit, { at: [0.04, 0.6, 0], facing: 'x+', w: 1.46, h: 0.68, panes: 3 }),
      ...glassWindow(kit, { at: [cx, 0.6, SHOP.z], facing: 'z+', w: 0.5, h: 0.4 }),
      ...glassWindow(kit, { at: [cx, 0.6, -SHOP.z], facing: 'z-', w: 0.5, h: 0.4 }),
      ...glassWindow(kit, { at: [SHOP.x0, 0.6, 0], facing: 'x-', w: 0.8, h: 0.4 }),
      // shelf and a striped awning over the window
      kit.box([SHELF.x1 - SHELF.x0, SHELF.h, SHELF.z * 2], [(SHELF.x0 + SHELF.x1) / 2, SHELF.h / 2, 0], 'blue'),
    ];
    for (let i = 0; i < 6; i++) {
      const z = -0.75 + 0.25 * (i + 0.5);
      parts.push(kit.box([0.2, 0.04, 0.25], [0.1, 1.0, z], i % 2 === 0 ? 'red' : 'white', { rotate: [0, 0, -0.25] }));
    }
    // teddy bear on the shelf
    const tx = 0.24;
    const tz = -0.38;
    const tb = SHELF.h;
    parts.push(
      kit.sphere(0.14, [tx, tb + 0.14, tz], 'wood', { scale: [1, 1.05, 1] }),
      kit.sphere(0.1, [tx, tb + 0.38, tz], 'wood'),
      kit.sphere(0.04, [tx, tb + 0.47, tz - 0.08], 'wood', { detail: 0 }),
      kit.sphere(0.04, [tx, tb + 0.47, tz + 0.08], 'wood', { detail: 0 }),
      kit.sphere(0.05, [tx + 0.08, tb + 0.36, tz], 'sand', { detail: 0 }),
      kit.sphere(0.02, [tx + 0.09, tb + 0.4, tz - 0.04], 'charcoal', { detail: 0 }),
      kit.sphere(0.02, [tx + 0.09, tb + 0.4, tz + 0.04], 'charcoal', { detail: 0 }),
      kit.sphere(0.05, [tx, tb + 0.18, tz - 0.14], 'wood', { detail: 0 }),
      kit.sphere(0.05, [tx, tb + 0.18, tz + 0.14], 'wood', { detail: 0 }),
      kit.sphere(0.055, [tx + 0.1, tb + 0.14, tz], 'sand', { detail: 0, scale: [0.6, 1, 1] }),
    );
    // rocket on the shelf
    const rx = 0.24;
    const rz = 0.4;
    parts.push(
      kit.cylinder(0.09, 0.09, 0.42, [rx, tb + 0.05 + 0.21, rz], 'white', { segments: 8 }),
      kit.cone(0.09, 0.2, [rx, tb + 0.05 + 0.42 + 0.1, rz], 'red', { segments: 8 }),
      kit.box([0.34, 0.14, 0.03], [rx, tb + 0.05 + 0.1, rz], 'red'),
      kit.box([0.03, 0.14, 0.34], [rx, tb + 0.05 + 0.1, rz], 'red'),
      kit.cylinder(0.05, 0.07, 0.05, [rx, tb + 0.025, rz], 'orange', { segments: 8 }),
      kit.sphere(0.04, [rx + 0.085, tb + 0.38, rz], 'blue', { detail: 0, scale: [0.5, 1, 1] }),
    );
    // toy blocks on the roof (colour only)
    const rt = roofY + 0.08;
    parts.push(
      kit.box([0.2, 0.2, 0.2], [-0.15, rt + 0.1, 0.6], 'red', { rotate: [0, 0.4, 0] }),
      kit.box([0.2, 0.2, 0.2], [-0.15, rt + 0.1, 0.25], 'leaf', { rotate: [0, -0.3, 0] }),
      kit.box([0.18, 0.18, 0.18], [-0.15, rt + 0.29, 0.43], 'pink', { rotate: [0, 0.2, 0] }),
      // light strip along the roof edge
      kit.box([0.03, 0.05, SHOP.z * 2 - 0.1], [SHOP.x1 + 0.065, roofY + 0.04, 0], 'orange', { glow: true }),
      kit.box([0.2, 0.2, 0.2], [-0.15, rt + 0.1, -0.65], 'purple', { rotate: [0, 0.3, 0] }),
    );
    // rooftop board with a neon star (a pentagram of five strokes)
    const bottom = BOARD.y - BOARD.h / 2;
    for (const dz of [-0.3, 0.3]) {
      parts.push(kit.cylinder(0.03, 0.03, bottom - rt + 0.05, [BOARD.x, (rt + bottom) / 2 - 0.02, dz], 'woodDark', { segments: 4 }));
    }
    const nx = BOARD.x + BOARD.d / 2 + 0.03;
    parts.push(kit.box([BOARD.d, BOARD.h, BOARD.w], [BOARD.x, BOARD.y, 0], 'navy'));
    const pts: Array<[number, number]> = [];
    for (let i = 0; i < 5; i++) {
      const a = Math.PI / 2 + (i * Math.PI * 2) / 5;
      pts.push([BOARD.y + 0.02 + Math.sin(a) * STAR_R, Math.cos(a) * STAR_R]);
    }
    for (let i = 0; i < 5; i++) {
      const [y0, z0] = pts[i];
      const [y1, z1] = pts[(i + 2) % 5];
      const dy = y1 - y0;
      const dz = z1 - z0;
      const len = Math.hypot(dy, dz);
      parts.push(kit.box([0.05, len, 0.05], [nx, (y0 + y1) / 2, (z0 + z1) / 2], 'sunYellow', { glow: true, rotate: [Math.atan2(dz, dy), 0, 0] }));
    }
    return kit.finish(parts);
  },
};
