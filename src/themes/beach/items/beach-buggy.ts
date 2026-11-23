import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod, wheel } from '../../../models/parts';

const WHEEL = { r: 0.17, tube: 0.07, x: 0.4, z: 0.55 };
const CAGE = 0.3; // roll-cage half width

/** รถบักกี้ชายหาด: a chunky open beach buggy (nose towards +z) with big tyres and a roll cage. */
export const item: ItemModel = {
  id: 'beach-buggy',
  name: 'รถบักกี้ชายหาด',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.62, 0.2, 1.2], [0, 0.32, -0.05], 'red'), // tub
      kit.box([0.5, 0.14, 0.4], [0, 0.34, 0.63], 'red'), // hood
      kit.box([0.5, 0.22, 0.3], [0, 0.37, -0.72], 'charcoal'), // engine
      kit.cylinder(0.04, 0.04, 0.2, [0.1, 0.4, -0.9], 'chrome', { segments: 8, rotate: [Math.PI / 2, 0, 0] }), // exhaust
      kit.box([0.62, 0.06, 0.06], [0, 0.24, 0.86], 'chrome'), // bumpers
      kit.box([0.62, 0.06, 0.06], [0, 0.24, -0.92], 'chrome'),
      kit.sphere(0.05, [0.19, 0.36, 0.84], 'lampWarm', { detail: 0, glow: true }), // headlights
      kit.sphere(0.05, [-0.19, 0.36, 0.84], 'lampWarm', { detail: 0, glow: true }),
      kit.box([0.22, 0.06, 0.26], [0.15, 0.45, 0.08], 'sunYellow'), // seats
      kit.box([0.22, 0.26, 0.05], [0.15, 0.56, -0.07], 'sunYellow'),
      kit.box([0.22, 0.06, 0.26], [-0.15, 0.45, 0.08], 'sunYellow'),
      kit.box([0.22, 0.26, 0.05], [-0.15, 0.56, -0.07], 'sunYellow'),
      kit.torus(0.065, 0.018, [0.15, 0.6, 0.3], 'charcoal', { radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0.5] }), // steering wheel
      // roll cage
      rod(kit, [CAGE, 0.42, 0.34], [CAGE, 1.0, 0.22], 0.03, 'chrome'),
      rod(kit, [-CAGE, 0.42, 0.34], [-CAGE, 1.0, 0.22], 0.03, 'chrome'),
      rod(kit, [CAGE, 0.42, -0.38], [CAGE, 1.0, -0.38], 0.03, 'chrome'),
      rod(kit, [-CAGE, 0.42, -0.38], [-CAGE, 1.0, -0.38], 0.03, 'chrome'),
      rod(kit, [CAGE, 1.0, 0.22], [CAGE, 1.0, -0.38], 0.03, 'chrome'),
      rod(kit, [-CAGE, 1.0, 0.22], [-CAGE, 1.0, -0.38], 0.03, 'chrome'),
      rod(kit, [-CAGE, 1.0, -0.38], [CAGE, 1.0, -0.38], 0.03, 'chrome'),
      rod(kit, [-CAGE, 1.0, 0.22], [CAGE, 1.0, 0.22], 0.03, 'chrome'),
    ];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        parts.push(...wheel(kit, {
          at: [sx * WHEEL.x, WHEEL.r + WHEEL.tube, sz * WHEEL.z], radius: WHEEL.r, tube: WHEEL.tube, axis: 'x', color: 'charcoal',
          hubColor: 'orange', hubRadius: 0.07, hubLength: 0.16, spokes: 1, spokeColor: 'stone', radialSegments: 6, tubularSegments: 12,
        }));
      }
    }
    return kit.finish(parts);
  },
};
