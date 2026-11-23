import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { wheel } from '../../../models/parts';

// A Thai tuk-tuk (1×2, long side along z, nose towards +z): two-tone body, open sides, a pink roof, three wheels
// and blinking side lights.
const WHEEL = { r: 0.11, tube: 0.04 };
const AXLE_Y = WHEEL.r + WHEEL.tube;
const TUB = { w: 0.5, h: 0.2, d: 0.95, z: -0.15, y: 0.2 };
const ROOF_Y = 0.78;

/** รถตุ๊กตุ๊ก: a colourful parked tuk-tuk with blinking side lights. */
export const item: ItemModel = {
  id: 'tuk-tuk',
  name: 'รถตุ๊กตุ๊ก',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([TUB.w, TUB.h, TUB.d], [0, TUB.y + TUB.h / 2, TUB.z], 'sunYellow'), // passenger tub
    ];
    parts.push(
      kit.box([TUB.w + 0.02, 0.06, TUB.d + 0.02], [0, TUB.y + 0.03, TUB.z], 'leaf'),
      // nose: a rounded front cowl and a headlamp
      kit.box([0.34, 0.26, 0.3], [0, 0.31, 0.5], 'red'),
      kit.sphere(0.17, [0, 0.4, 0.58], 'red', { scale: [1, 0.8, 1.1] }),
      kit.sphere(0.05, [0, 0.4, 0.74], 'lampWarm', { detail: 0, glow: true }),
      kit.box([0.3, 0.07, 0.02], [0, 0.2, 0.67], 'chrome'),
      // seats (a bench across the back and a back rest)
      kit.box([0.4, 0.05, 0.4], [0, 0.43, -0.4], 'redDark'),
      kit.box([0.4, 0.26, 0.05], [0, 0.55, -0.6], 'redDark'),
      // handlebar on a stem
      kit.cylinder(0.02, 0.02, 0.3, [0, 0.58, 0.45], 'charcoal', { segments: 6 }),
      kit.box([0.34, 0.03, 0.03], [0, 0.72, 0.45], 'chrome'),
      // roof on four posts, with a pink scalloped edge
      kit.box([0.62, 0.05, 0.95], [0, ROOF_Y, -0.2], 'pink'),
      kit.box([0.5, 0.05, 0.8], [0, ROOF_Y + 0.05, -0.2], 'white'),
      kit.box([0.62, 0.05, 0.05], [0, ROOF_Y - 0.01, 0.3], 'purple'),
    );
    for (const sx of [-1, 1]) for (const z of [-0.62, 0.15]) parts.push(kit.box([0.035, ROOF_Y - TUB.y - TUB.h, 0.035], [sx * 0.26, (ROOF_Y + TUB.y + TUB.h) / 2, z], 'woodDark'));
    // wheels: one at the front under the nose, two at the back
    parts.push(...wheel(kit, { at: [0, AXLE_Y, 0.58], radius: WHEEL.r, tube: WHEEL.tube, axis: 'z', color: 'charcoal', hubColor: 'stone', tubularSegments: 12 }));
    for (const sx of [-1, 1]) parts.push(...wheel(kit, { at: [sx * (TUB.w / 2 + 0.02), AXLE_Y, -0.45], radius: WHEEL.r, tube: WHEEL.tube, axis: 'x', color: 'charcoal', hubColor: 'stone' }));
    // blinking side lights (a few small ones) and steady little ones along the roof edge
    for (const sx of [-1, 1]) {
      parts.push(
        kit.sphere(0.035, [sx * 0.33, 0.36, 0.3], 'orange', { detail: 0, glow: true, light: 'blink' }),
        kit.sphere(0.035, [sx * 0.33, 0.36, -0.7], 'red', { detail: 0, glow: true, light: 'blink' }),
        kit.sphere(0.03, [sx * 0.31, ROOF_Y - 0.03, -0.62], 'lime', { detail: 0, glow: true, light: 'breathe' }),
      );
    }
    return kit.finish(parts);
  },
};
