import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const BASE = 0.04;

/** ลานสเก็ตบอร์ด: a concrete plaza with a painted bowl, a ramp and a grind rail. Paint is shapes and colours only. */
export const item: ItemModel = {
  id: 'skate-park',
  name: 'ลานสเก็ตบอร์ด',
  category: 'play',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.96, BASE, 2.96], [0, BASE / 2, 0], 'stone')];

    // the bowl (z = +0.8): a raised white coping ring around a dark dish with coloured paint rings
    const bz = 0.8;
    parts.push(
      kit.cylinder(0.7, 0.7, 0.03, [0.05, BASE + 0.015, bz], 'white', { segments: 16 }),
      kit.cylinder(0.58, 0.58, 0.04, [0.05, BASE + 0.02, bz], 'stoneDark', { segments: 16 }),
      kit.cylinder(0.42, 0.42, 0.05, [0.05, BASE + 0.025, bz], 'pink', { segments: 16 }),
      kit.cylinder(0.28, 0.28, 0.06, [0.05, BASE + 0.03, bz], 'sunYellow', { segments: 16 }),
      kit.cylinder(0.12, 0.12, 0.07, [0.05, BASE + 0.035, bz], 'teal', { segments: 16 }),
    );

    // the ramp (z = -0.15): high at -x, sloping down to +x, with painted stripes
    const rz = -0.2;
    parts.push(
      kit.wedge([1.0, 0.42, 0.9], [-0.35, BASE + 0.21, rz], 'purple', { apex: -0.5 }),
      kit.wedge([1.02, 0.44, 0.12], [-0.34, BASE + 0.215, rz - 0.28], 'sunYellow', { apex: -0.5 }),
      kit.wedge([1.02, 0.44, 0.12], [-0.34, BASE + 0.215, rz + 0.28], 'sunYellow', { apex: -0.5 }),
      // coping bar across the top edge
      kit.cylinder(0.03, 0.03, 0.92, [-0.84, BASE + 0.42, rz], 'chrome', { segments: 6, rotate: [Math.PI / 2, 0, 0] }),
    );

    // the grind rail (z = -1.15) on red legs, plus a low funbox beside it
    const gz = -1.15;
    parts.push(
      kit.cylinder(0.025, 0.025, 1.3, [0.0, BASE + 0.26, gz], 'chrome', { segments: 6, rotate: [0, 0, Math.PI / 2] }),
      kit.box([0.06, 0.26, 0.06], [-0.55, BASE + 0.13, gz], 'red'),
      kit.box([0.06, 0.26, 0.06], [0.55, BASE + 0.13, gz], 'red'),
      kit.box([0.06, 0.26, 0.06], [0.0, BASE + 0.13, gz], 'red'),
    );
    parts.push(
      kit.box([0.5, 0.2, 0.5], [0.5, BASE + 0.1, -0.35], 'orange'),
      kit.box([0.52, 0.03, 0.52], [0.5, BASE + 0.215, -0.35], 'white'),
      kit.wedge([0.22, 0.2, 0.5], [0.86, BASE + 0.1, -0.35], 'orange', { apex: -0.5 }),
    );
    // a rolling board left on the plaza
    parts.push(
      kit.box([0.32, 0.025, 0.1], [0.55, BASE + 0.045, 1.35], 'blue', { rotate: [0, 0.3, 0] }),
      kit.cylinder(0.025, 0.025, 0.12, [0.45, BASE + 0.025, 1.38], 'white', { segments: 6, rotate: [Math.PI / 2, 0, 0.0] }),
      kit.cylinder(0.025, 0.025, 0.12, [0.65, BASE + 0.025, 1.3], 'white', { segments: 6, rotate: [Math.PI / 2, 0, 0.0] }),
    );
    return kit.finish(parts);
  },
};
