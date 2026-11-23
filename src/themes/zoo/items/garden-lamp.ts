import type { ItemModel } from '../../../models/contract';

// 1x1. A wooden post with a warm lantern on top that breathes at night, a stone foot and a few flowers.
const FOOT_H = 0.04;
const POST = { r: 0.05, h: 0.95 };
const TOP = FOOT_H + POST.h;
const LANTERN = { w: 0.2, h: 0.2 };

/** ไฟสวน: wooden post lamp. */
export const item: ItemModel = {
  id: 'garden-lamp',
  name: 'ไฟสวน',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const lanternY = TOP + 0.03 + LANTERN.h / 2;
    const parts = [
      kit.cylinder(0.3, 0.3, FOOT_H, [0, FOOT_H / 2, 0], 'lime', { segments: 10 }),
      kit.cylinder(0.12, 0.14, 0.06, [0, FOOT_H + 0.03, 0], 'stone', { segments: 8 }),
      kit.cylinder(POST.r, POST.r + 0.015, POST.h, [0, FOOT_H + POST.h / 2, 0], 'wood', { segments: 7 }),
      kit.box([0.2, 0.04, 0.04], [0, TOP - 0.18, 0], 'woodDark'), // cross brace
      kit.box([LANTERN.w + 0.04, 0.03, LANTERN.w + 0.04], [0, TOP + 0.015, 0], 'woodDark'), // lantern floor
      kit.box([LANTERN.w - 0.03, LANTERN.h - 0.02, LANTERN.w - 0.03], [0, lanternY, 0], 'lampWarm', { glow: true, light: 'breathe' }),
      kit.cone(LANTERN.w * 0.85, 0.13, [0, TOP + 0.03 + LANTERN.h + 0.065, 0], 'red', { segments: 4, rotate: [0, Math.PI / 4, 0] }),
      kit.sphere(0.03, [0, TOP + 0.03 + LANTERN.h + 0.15, 0], 'brass', { detail: 0 }),
    ];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) parts.push(kit.box([0.03, LANTERN.h, 0.03], [sx * LANTERN.w / 2, lanternY, sz * LANTERN.w / 2], 'woodDark'));
    }
    // a few flowers at the foot
    parts.push(
      kit.sphere(0.09, [0.2, FOOT_H + 0.06, 0.1], 'leaf', { detail: 0 }),
      kit.sphere(0.04, [0.22, FOOT_H + 0.14, 0.12], 'pink', { detail: 0 }),
      kit.sphere(0.08, [-0.18, FOOT_H + 0.05, -0.16], 'leaf', { detail: 0 }),
      kit.sphere(0.04, [-0.2, FOOT_H + 0.12, -0.14], 'sunYellow', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
