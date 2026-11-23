import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow } from '../../../models/parts';

// An ATM kiosk (1×2, long side along z, front +x): an open-front booth with two cash machines
// whose screens glow, lit side windows and a teal neon coin and two cards on a rooftop fascia.
const BASE_H = 0.04;
const WALL_H = 1.0;
const ROOF_Y = BASE_H + WALL_H + 0.04;
const MACHINE = { x: 0.02, w: 0.34, h: 0.7, d: 0.5, z: [-0.4, 0.4] };

/** ตู้ ATM: a small booth with two cash machines with glowing screens. */
export const item: ItemModel = {
  id: 'atm-kiosk',
  name: 'ตู้ ATM',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.0, BASE_H, 1.96], [0, BASE_H / 2, 0], 'stone'),
      kit.box([0.05, WALL_H, 1.9], [-0.42, BASE_H + WALL_H / 2, 0], 'blue'),
      kit.box([0.8, WALL_H, 0.05], [-0.05, BASE_H + WALL_H / 2, 0.93], 'blue'),
      kit.box([0.8, WALL_H, 0.05], [-0.05, BASE_H + WALL_H / 2, -0.93], 'blue'),
      kit.box([1.0, 0.08, 1.96], [0, ROOF_Y, 0], 'navy'),
      ...glassWindow(kit, { at: [-0.05, 0.6, 0.955], facing: 'z+', w: 0.4, h: 0.4 }),
      ...glassWindow(kit, { at: [-0.05, 0.6, -0.955], facing: 'z-', w: 0.4, h: 0.4 }),
      ...glassWindow(kit, { at: [-0.445, 0.6, 0], facing: 'x-', w: 1.0, h: 0.4, panes: 3 }),
    ];
    for (const z of MACHINE.z) {
      const top = BASE_H + MACHINE.h;
      parts.push(
        kit.box([MACHINE.w, MACHINE.h, MACHINE.d], [MACHINE.x, BASE_H + MACHINE.h / 2, z], 'stone'),
        kit.box([MACHINE.w + 0.04, 0.05, MACHINE.d + 0.04], [MACHINE.x, top + 0.025, z], 'charcoal'),
        kit.box([0.02, 0.2, 0.32], [MACHINE.x + MACHINE.w / 2 + 0.01, top - 0.2, z], 'skyBlue', { glow: true }),
        kit.box([0.1, 0.04, 0.3], [MACHINE.x + MACHINE.w / 2 + 0.05, top - 0.38, z], 'charcoal'),
        kit.box([0.02, 0.05, 0.22], [MACHINE.x + MACHINE.w / 2 + 0.01, top - 0.55, z], 'charcoal'),
        kit.box([0.02, 0.04, 0.1], [MACHINE.x + MACHINE.w / 2 + 0.015, top - 0.46, z + 0.15], 'sunYellow'),
      );
    }
    // rooftop fascia with a neon coin between two neon cards
    const fx = 0.42;
    const fy = ROOF_Y + 0.04 + 0.15;
    const nx = fx + 0.045;
    parts.push(
      kit.box([0.04, 0.3, 1.6], [fx, fy, 0], 'navy'),
      kit.torus(0.1, 0.02, [nx, fy, 0], 'teal', { radialSegments: 4, tubularSegments: 16, rotate: [0, Math.PI / 2, 0], glow: true }),
      kit.cylinder(0.04, 0.04, 0.02, [nx, fy, 0], 'teal', { segments: 8, rotate: [0, 0, Math.PI / 2], glow: true }),
    );
    for (const z of [-0.5, 0.5]) {
      parts.push(
        kit.box([0.02, 0.1, 0.2], [nx - 0.01, fy, z], 'teal', { glow: true }),
        kit.box([0.025, 0.03, 0.2], [nx - 0.005, fy + 0.02, z], 'navy'),
      );
    }
    return kit.finish(parts);
  },
};
