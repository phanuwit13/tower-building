import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A ride-on toy car in bright red, nose towards +x: open cockpit with a blue seat and a steering wheel seen from above.
const WHEEL = { r: 0.1, w: 0.07, x: 0.24, z: 0.235 };

/** รถของเล่นเด็ก: a ride-on toy car in a bright colour. */
export const item: ItemModel = {
  id: 'toy-car',
  name: 'รถของเล่นเด็ก',
  category: 'play',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.72, 0.1, 0.42], [0, 0.17, 0], 'red'), // chassis
      kit.box([0.28, 0.1, 0.4], [0.22, 0.27, 0], 'red'), // hood
      kit.box([0.28, 0.012, 0.1], [0.22, 0.326, 0], 'sunYellow'), // hood stripe
      kit.box([0.2, 0.26, 0.4], [-0.24, 0.35, 0], 'red'), // rear body behind the seat
      kit.box([0.2, 0.05, 0.34], [-0.04, 0.245, 0], 'blue'), // seat
      kit.box([0.02, 0.16, 0.34], [0.07, 0.4, 0], 'skyBlue', { rotate: [0, 0, 0.25] }), // windscreen
      kit.torus(0.06, 0.013, [0.03, 0.34, 0], 'charcoal', { radialSegments: 4, rotate: [Math.PI / 2 - 0.4, 0, 0] }), // steering wheel
      kit.box([0.05, 0.06, 0.44], [0.385, 0.15, 0], 'chrome'), // bumper
      kit.box([0.04, 0.06, 0.4], [-0.37, 0.15, 0], 'chrome'),
    ];
    for (const sz of [-1, 1]) {
      parts.push(kit.sphere(0.04, [0.375, 0.28, sz * 0.14], 'lampWarm', { detail: 0 })); // headlights
      for (const sx of [-1, 1]) {
        const at: [number, number, number] = [sx * WHEEL.x, WHEEL.r, sz * WHEEL.z];
        parts.push(
          kit.cylinder(WHEEL.r, WHEEL.r, WHEEL.w, at, 'charcoal', { rotate: [Math.PI / 2, 0, 0] }),
          kit.cylinder(0.05, 0.05, WHEEL.w + 0.012, at, 'sunYellow', { rotate: [Math.PI / 2, 0, 0], segments: 8 }),
        );
      }
    }
    return kit.finish(parts);
  },
};
