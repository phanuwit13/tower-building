import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Footprint 1x1 (front faces +x). A white cooler with a big blue bottle on top, two taps over a drip tray and glasses.
const BODY_H = 0.95;

/** ตู้กดน้ำดื่ม: water dispenser with a blue bottle and glasses. */
export const item: ItemModel = {
  id: 'water-dispenser',
  name: 'ตู้กดน้ำดื่ม',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.46, 0.04, 0.46], [0, 0.02, 0], 'stoneDark'),
      kit.box([0.44, BODY_H - 0.04, 0.44], [0, 0.04 + (BODY_H - 0.04) / 2, 0], 'white'),
      kit.box([0.48, 0.05, 0.48], [0, BODY_H + 0.025, 0], 'skyBlue'),
      // front panel: blue plate, a red and a blue tap button, spouts
      kit.box([0.02, 0.24, 0.34], [0.225, 0.68, 0], 'skyBlue'),
      kit.box([0.04, 0.05, 0.07], [0.24, 0.74, -0.08], 'blue'),
      kit.box([0.04, 0.05, 0.07], [0.24, 0.74, 0.08], 'red'),
      kit.cylinder(0.018, 0.018, 0.08, [0.26, 0.66, -0.08], 'chrome', { segments: 6, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.018, 0.018, 0.08, [0.26, 0.66, 0.08], 'chrome', { segments: 6, rotate: [0, 0, Math.PI / 2] }),
      // drip tray
      kit.box([0.12, 0.025, 0.4], [0.26, 0.55, 0], 'charcoal'),
      kit.box([0.1, 0.01, 0.34], [0.26, 0.5675, 0], 'stoneDark'),
      // cabinet door line and knob
      kit.box([0.02, 0.4, 0.34], [0.225, 0.28, 0], 'stone'),
      kit.sphere(0.03, [0.25, 0.36, 0.1], 'sunYellow', { detail: 0 }),
      // bottle on top: a blue jug, a rounded shoulder and a cap
      kit.cylinder(0.17, 0.17, 0.34, [0, BODY_H + 0.22, 0], 'glassBlue', { segments: 10 }),
      kit.cylinder(0.155, 0.155, 0.24, [0, BODY_H + 0.17, 0], 'skyBlue', { segments: 10 }),
      kit.dome(0.17, [0, BODY_H + 0.39, 0], 'glassBlue', { segments: 10, scale: [1, 0.6, 1] }),
      kit.cylinder(0.05, 0.06, 0.05, [0, BODY_H + 0.52, 0], 'blue', { segments: 8 }),
    ];
    // two glasses on the drip tray
    for (const z of [-0.1, 0.1]) {
      parts.push(
        kit.cylinder(0.045, 0.035, 0.1, [0.26, 0.625, z], 'glassBlue', { segments: 8 }),
        kit.cylinder(0.038, 0.03, 0.055, [0.26, 0.6, z], 'skyBlue', { segments: 8 }),
      );
    }
    return kit.finish(parts);
  },
};
