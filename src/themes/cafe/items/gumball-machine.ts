import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Red stand with a glass globe (drawn as two thin glass bands, so the gumballs show) of gumballs.
const GLOBE_Y = 0.92;
const GLOBE_R = 0.3;
const BALL_R = 0.07;
const COLORS = ['red', 'sunYellow', 'blue', 'pink', 'lime', 'orange', 'purple', 'mint'] as const;

/** ตู้ลูกอมหยอดเหรียญ: a red stand with a glass globe of colourful gumballs. */
export const item: ItemModel = {
  id: 'gumball-machine',
  name: 'ตู้ลูกอมหยอดเหรียญ',
  category: 'play',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.3, 0.34, 0.06, [0, 0.03, 0], 'charcoal', { segments: 12 }),
      kit.cylinder(0.14, 0.2, 0.34, [0, 0.23, 0], 'red', { segments: 12 }),
      kit.cylinder(0.3, 0.2, 0.2, [0, 0.5, 0], 'red', { segments: 12 }),
      // coin slot plate and the turning knob, facing +x
      kit.box([0.03, 0.14, 0.14], [0.3, 0.5, 0], 'sunYellow'),
      kit.cylinder(0.06, 0.06, 0.04, [0.33, 0.5, 0], 'chrome', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.box([0.04, 0.04, 0.1], [0.34, 0.5, 0], 'charcoal'),
      // chute
      kit.box([0.1, 0.1, 0.18], [0.3, 0.3, 0], 'charcoal'),
      kit.sphere(0.05, [0.32, 0.29, 0], 'pink', { detail: 0 }),
      // glass globe: rings at the equator and the top, a red cap
      kit.torus(GLOBE_R, 0.018, [0, GLOBE_Y, 0], 'glassBlue', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 16 }),
      kit.torus(GLOBE_R * 0.99, 0.014, [0, GLOBE_Y, 0], 'glassBlue', { radialSegments: 4, tubularSegments: 16 }),
      kit.torus(GLOBE_R * 0.99, 0.014, [0, GLOBE_Y, 0], 'glassBlue', { rotate: [0, Math.PI / 2, 0], radialSegments: 4, tubularSegments: 16 }),
      kit.dome(0.14, [0, GLOBE_Y + GLOBE_R - 0.03, 0], 'red', { segments: 8 }),
      kit.sphere(0.04, [0, GLOBE_Y + GLOBE_R + 0.11, 0], 'sunYellow', { detail: 0 }),
    ];
    let n = 0;
    for (let ix = -2; ix <= 2; ix++) for (let iy = -2; iy <= 2; iy++) for (let iz = -2; iz <= 2; iz++) {
      const p = [ix * 0.15, iy * 0.15, iz * 0.15];
      if (Math.hypot(p[0], p[1] * 1.0, p[2]) > GLOBE_R - BALL_R + 0.0 || p[1] > 0.17) continue;
      parts.push(kit.sphere(BALL_R, [p[0], GLOBE_Y + p[1] - 0.03, p[2]], COLORS[n++ % COLORS.length], { detail: 0 }));
    }
    return kit.finish(parts);
  },
};
