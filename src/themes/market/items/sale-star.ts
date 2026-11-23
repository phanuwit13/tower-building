import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A sale star-burst sign (1×1, facing +x) on a post: a red burst with a smaller golden burst on top
// whose glow blinks gently. Shape only, no text.
const POST = { h: 0.78 };
const STAR = { y: 1.05, spikes: 12, rBody: 0.14, long: 0.2, short: 0.12 };

/** ป้ายดาวลดราคา: a blinking star-burst sign on a post. */
export const item: ItemModel = {
  id: 'sale-star',
  name: 'ป้ายดาวลดราคา',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.2, 0.24, 0.06, [0, 0.03, 0], 'stone', { segments: 10 }),
      kit.cylinder(0.03, 0.03, POST.h, [0, POST.h / 2, 0], 'charcoal', { segments: 8 }),
      kit.cylinder(STAR.rBody, STAR.rBody, 0.05, [0, STAR.y, 0], 'red', { segments: 12, rotate: [0, 0, Math.PI / 2] }),
    ];
    // spikes lie in the y–z plane, pointing out from the centre; alternate long and short
    for (let i = 0; i < STAR.spikes; i++) {
      const a = (i / STAR.spikes) * Math.PI * 2;
      const len = i % 2 ? STAR.short : STAR.long;
      const mid = STAR.rBody - 0.02 + len / 2;
      const at = (r: number, x: number): [number, number, number] => [x, STAR.y + Math.cos(a) * r, Math.sin(a) * r];
      parts.push(
        kit.cone(0.075, len, at(mid, 0), 'red', { segments: 6, scale: [0.4, 1, 1], rotate: [-a, 0, 0] }),
        kit.cone(0.045, len * 0.7, at(mid - len * 0.1, 0.03), 'sunYellow', { segments: 6, scale: [0.4, 1, 1], rotate: [-a, 0, 0], glow: 'sunYellow', light: 'blink' }),
      );
    }
    parts.push(
      kit.cylinder(0.1, 0.1, 0.04, [0.04, STAR.y, 0], 'orange', { segments: 12, rotate: [0, 0, Math.PI / 2], glow: 'orange', light: 'blink' }),
    );
    return kit.finish(parts);
  },
};
