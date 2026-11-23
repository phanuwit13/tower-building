import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// Stacked wooden crates of vegetables (1×1): two crates side by side and one across the top, each heaped with
// its own vegetable (carrots, cabbages, tomatoes, aubergines, peppers).
const CRATE = { w: 0.44, d: 0.8, h: 0.22 };

/** one slatted crate centred at (x, z), its floor at y0, long side along z or x (turned) */
function crate(kit: Parameters<ItemModel['build']>[0], x: number, y0: number, z: number, turned: boolean): Part[] {
  const [w, d] = turned ? [CRATE.d, CRATE.w] : [CRATE.w, CRATE.d];
  const cy = y0 + CRATE.h / 2;
  return [
    kit.box([w, CRATE.h, d], [x, cy, z], 'sand'),
    kit.box([w + 0.02, 0.04, d + 0.02], [x, y0 + 0.04, z], 'wood'),
    kit.box([w + 0.02, 0.04, d + 0.02], [x, y0 + CRATE.h - 0.03, z], 'wood'),
    kit.box([w + 0.02, 0.03, d + 0.02], [x, y0 + 0.12, z], 'terracotta'),
  ];
}

/** ลังผัก: stacked crates of vegetables. */
export const item: ItemModel = {
  id: 'veg-crate',
  name: 'ลังผัก',
  category: 'food',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.96, 0.03, 0.96], [0, 0.015, 0], 'stone')];
    const g = 0.03;
    const topY = g + CRATE.h; // bottom crates' lids
    parts.push(...crate(kit, -0.24, g, 0, false), ...crate(kit, 0.24, g, 0, false), ...crate(kit, 0, topY, 0, true));
    // vegetables heaped on the two lower crates (tops free) and on the upper crate
    const heap = (x: number, z: number, y: number, c: PaletteColor, r: number) => kit.sphere(r, [x, y, z], c, { detail: 0 });
    const y1 = topY - 0.02;
    // lower-left crate: tomatoes, lower-right: cabbages (the upper crate leaves the front/back ends visible)
    parts.push(
      heap(-0.24, -0.3, y1 + 0.05, 'red', 0.1), heap(-0.24, 0.3, y1 + 0.05, 'red', 0.1), heap(-0.3, -0.22, y1 + 0.03, 'redDark', 0.07),
      heap(0.24, -0.3, y1 + 0.1, 'leaf', 0.12), heap(0.24, 0.3, y1 + 0.1, 'leaf', 0.12),
      kit.cylinder(0.03, 0.03, 0.1, [0.4, y1 + 0.05, 0.4], 'charcoal', { segments: 6 }),
      kit.sphere(0.06, [0.4, y1 + 0.15, 0.4], 'orange', { detail: 0, glow: true, light: 'breathe' }), // lantern
    );
    // upper crate (runs along x): carrots on one half and aubergines on the other, plus a pepper
    const y2 = topY + CRATE.h - 0.02;
    for (const [x, z] of [[-0.3, -0.08], [-0.15, 0.08], [0.0, -0.08], [-0.2, 0.14]]) {
      parts.push(kit.cone(0.045, 0.22, [x, y2 + 0.03, z], 'orange', { segments: 6, rotate: [0, 0, Math.PI / 2 + 0.3] }));
    }
    for (const [x, z] of [[0.2, -0.08], [0.32, 0.08], [0.14, 0.1]]) {
      parts.push(kit.sphere(0.075, [x, y2 + 0.05, z], 'purple', { detail: 0, scale: [1.5, 0.9, 0.9] }));
    }
    parts.push(heap(0.0, 0.14, y2 + 0.05, 'sunYellow', 0.07));
    return kit.finish(parts);
  },
};
