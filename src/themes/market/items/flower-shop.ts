import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, glassWindow } from '../../../models/parts';

// A flower shop (2×2, front +x): a mint shop with a pink-and-white awning, buckets of flowers
// out front that sway, and a purple neon flower on a rooftop board.
const BASE_H = 0.04;
const SHOP = { x0: -0.95, x1: -0.1, z: 0.9, top: 0.95 };
const AWNING = { tilt: 0.3, y: 0.72, stripes: 6 };
const BUCKET = { h: 0.2, r: 0.1 };
const FLOWERS: PaletteColor[] = ['red', 'sunYellow', 'pink', 'purple', 'orange', 'white'];
const BOARD = { x: -0.3, y: 1.5, w: 1.1, h: 0.7, d: 0.06 };
const SWAY_AMOUNT = 0.12;

/** ร้านดอกไม้: a flower shop with swaying flower buckets and a flower neon. */
export const item: ItemModel = {
  id: 'flower-shop',
  name: 'ร้านดอกไม้',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const w = SHOP.x1 - SHOP.x0;
    const cx = (SHOP.x0 + SHOP.x1) / 2;
    const parts: Part[] = [
      kit.box([1.9, BASE_H, 1.9], [0, BASE_H / 2, 0], 'stone'),
      kit.box([w, SHOP.top - BASE_H, SHOP.z * 2], [cx, (BASE_H + SHOP.top) / 2, 0], 'mint'),
      kit.box([w + 0.1, 0.07, SHOP.z * 2 + 0.1 - 0.0], [cx, SHOP.top + 0.035, 0], 'leaf'),
      kit.box([w + 0.1, 0.05, 0.05], [cx, SHOP.top + 0.095, SHOP.z + 0.025], 'leafDark'),
      kit.box([w + 0.1, 0.05, 0.05], [cx, SHOP.top + 0.095, -SHOP.z - 0.025], 'leafDark'),
      ...door(kit, { at: [SHOP.x1, BASE_H + 0.25, 0], facing: 'x+', w: 0.22, h: 0.5, color: 'woodDark', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [SHOP.x1, 0.42, -0.52], facing: 'x+', w: 0.4, h: 0.28 }),
      ...glassWindow(kit, { at: [SHOP.x1, 0.42, 0.52], facing: 'x+', w: 0.4, h: 0.28 }),
      ...glassWindow(kit, { at: [cx, 0.5, SHOP.z], facing: 'z+', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [cx, 0.5, -SHOP.z], facing: 'z-', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [SHOP.x0, 0.5, 0], facing: 'x-', w: 0.7, h: 0.3 }),
    ];
    // striped awning over the front: slanted slabs, pink and white
    const stripeD = (SHOP.z * 2 - 0.1) / AWNING.stripes;
    for (let i = 0; i < AWNING.stripes; i++) {
      const z = -SHOP.z + 0.05 + stripeD * (i + 0.5);
      parts.push(kit.box([0.4, 0.04, stripeD], [SHOP.x1 + 0.17, AWNING.y, z], i % 2 === 0 ? 'pink' : 'white', { rotate: [0, 0, -AWNING.tilt] }));
    }
    // buckets of flowers: two rows out front, each flower head on a stem that sways about the bucket rim
    const rows: Array<{ x: number; zs: number[] }> = [
      { x: 0.45, zs: [-0.72, -0.36, 0, 0.36, 0.72] },
      { x: 0.78, zs: [-0.54, -0.18, 0.18, 0.54] },
    ];
    let n = 0;
    for (const row of rows) {
      for (const z of row.zs) {
        const sway = { kind: 'sway' as const, pivot: [row.x, BASE_H + BUCKET.h, z] as [number, number, number], amount: SWAY_AMOUNT };
        const top = BASE_H + BUCKET.h;
        parts.push(kit.cylinder(BUCKET.r, BUCKET.r - 0.02, BUCKET.h, [row.x, BASE_H + BUCKET.h / 2, z], n % 2 === 0 ? 'blue' : 'terracotta', { segments: 8 }));
        for (const [dx, dz, up] of [[0, 0, 0.26], [-0.04, 0.045, 0.2], [0.04, -0.045, 0.2]] as const) {
          const color = FLOWERS[(n + Math.round(dz * 20) + 3) % FLOWERS.length];
          parts.push(
            kit.cylinder(0.01, 0.01, up, [row.x + dx, top + up / 2, z + dz], 'leaf', { segments: 4, motion: sway }),
            kit.sphere(0.06, [row.x + dx, top + up + 0.02, z + dz], color, { detail: 0, motion: sway }),
          );
        }
        n++;
      }
    }
    // rooftop board with a purple neon flower (six petals round a yellow heart)
    const roofTop = SHOP.top + 0.07;
    const bottom = BOARD.y - BOARD.h / 2;
    for (const dz of [-0.35, 0.35]) {
      parts.push(kit.cylinder(0.03, 0.03, bottom - roofTop + 0.05, [BOARD.x, (roofTop + bottom) / 2 - 0.02, dz], 'woodDark', { segments: 4 }));
    }
    const nx = BOARD.x + BOARD.d / 2 + 0.03;
    parts.push(kit.box([BOARD.d, BOARD.h, BOARD.w], [BOARD.x, BOARD.y, 0], 'navy'));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      parts.push(kit.sphere(0.115, [nx, BOARD.y + 0.06 + Math.sin(a) * 0.2, Math.cos(a) * 0.2], 'purple', { detail: 0, scale: [0.35, 1, 1], glow: true }));
    }
    parts.push(
      kit.sphere(0.1, [nx, BOARD.y + 0.06, 0], 'sunYellow', { detail: 0, scale: [0.4, 1, 1], glow: true }),
      kit.box([0.04, 0.05, 0.6], [nx, BOARD.y - 0.26, 0], 'lime', { glow: true }),
      // light strips: along the roof edge and the awning's front edge
      kit.box([0.03, 0.05, SHOP.z * 2 - 0.1], [SHOP.x1 - 0.035, SHOP.top + 0.035, 0], 'purple', { glow: true }),
      kit.box([0.03, 0.03, SHOP.z * 2 - 0.1], [SHOP.x1 + 0.37, 0.65, 0], 'pink', { glow: true }),
    );
    return kit.finish(parts);
  },
};
