import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A big two-tier cake on a stand (1×1); candle flames glow and breathe. No writing on the cake.
const PLATE_Y = 0.46;
const T1 = { r: 0.38, h: 0.17 };
const T2 = { r: 0.25, h: 0.15 };
const CANDLES = 5;
const SPRINKLE = ['sunYellow', 'blue', 'lime', 'orange', 'purple'] as const;

/** เค้กวันเกิด: a big cake on a stand with candles that glow. */
export const item: ItemModel = {
  id: 'birthday-cake',
  name: 'เค้กวันเกิด',
  category: 'food',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const y1 = PLATE_Y + 0.03 + T1.h / 2;
    const top1 = PLATE_Y + 0.03 + T1.h;
    const top2 = top1 + T2.h;
    const parts: Part[] = [
      kit.cylinder(0.3, 0.34, 0.05, [0, 0.025, 0], 'white', { segments: 12 }),
      kit.cylinder(0.07, 0.1, PLATE_Y - 0.05, [0, 0.05 + (PLATE_Y - 0.05) / 2, 0], 'white', { segments: 12 }),
      kit.cylinder(0.46, 0.44, 0.03, [0, PLATE_Y + 0.015, 0], 'pink', { segments: 12 }),
      kit.cylinder(T1.r, T1.r, T1.h, [0, y1, 0], 'cream', { segments: 12 }),
      kit.cylinder(T1.r + 0.015, T1.r + 0.015, 0.05, [0, PLATE_Y + 0.055, 0], 'pink', { segments: 12 }),
      kit.cylinder(T1.r + 0.005, T1.r + 0.005, 0.03, [0, top1 - 0.015, 0], 'white', { segments: 12 }),
      kit.cylinder(T2.r, T2.r, T2.h, [0, top1 + T2.h / 2, 0], 'pink', { segments: 12 }),
      kit.cylinder(T2.r + 0.015, T2.r + 0.015, 0.05, [0, top1 + 0.025, 0], 'white', { segments: 12 }),
      kit.cylinder(T2.r + 0.005, T2.r + 0.005, 0.03, [0, top2 - 0.015, 0], 'white', { segments: 12 }),
    ];
    // cream dollops round the lower tier, a strawberry on each; sprinkles on the lower top
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const r = T1.r - 0.03;
      parts.push(kit.sphere(0.045, [r * Math.cos(a), top1 + 0.02, r * Math.sin(a)], 'white', { detail: 0 }));
      if (i % 2 === 0) parts.push(kit.sphere(0.03, [r * Math.cos(a), top1 + 0.06, r * Math.sin(a)], 'red', { detail: 0 }));
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      parts.push(kit.sphere(0.02, [0.3 * Math.cos(a), top1 + 0.01, 0.3 * Math.sin(a)], SPRINKLE[i % 5], { detail: 0 }));
    }
    // top: a ring of dollops and the candles (stripes in colour, flame glows)
    for (let i = 0; i < CANDLES; i++) {
      const a = (i / CANDLES) * Math.PI * 2;
      const x = 0.12 * Math.cos(a);
      const z = 0.12 * Math.sin(a);
      parts.push(
        kit.cylinder(0.02, 0.02, 0.16, [x, top2 + 0.08, z], SPRINKLE[i], { segments: 6 }),
        kit.sphere(0.035, [x, top2 + 0.19, z], 'sunYellow', { detail: 0, scale: [0.8, 1.3, 0.8], glow: true, light: 'breathe' }),
      );
    }
    parts.push(kit.sphere(0.045, [0, top2 + 0.02, 0], 'red', { detail: 0 }));
    return kit.finish(parts);
  },
};
