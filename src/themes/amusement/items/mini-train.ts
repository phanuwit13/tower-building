import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { wheel } from '../../../models/parts';

// A tiny train on a short track (1x2, along z): a red engine at the +z end with a chimney, a cab and a lamp,
// then two open carriages with benches. Wheels sit on chrome rails over wooden sleepers.
const BED = { w: 0.5, h: 0.03 };
const RAIL_X = 0.17;
const RAIL_TOP = 0.095;
const WHEEL = { r: 0.075, tube: 0.025 }; // wheel centre height = RAIL_TOP + r + tube
const AXLE_Y = RAIL_TOP + WHEEL.r + WHEEL.tube;
const CHASSIS_T = 0.05;
const ENGINE = { z0: 0.3, z1: 0.94 };
const CARS = [{ z0: -0.28, z1: 0.24, color: 'sunYellow' }, { z0: -0.9, z1: -0.34, color: 'blue' }] as const satisfies readonly { z0: number; z1: number; color: PaletteColor }[];

/** ขบวนรถไฟเล็ก: tiny engine and two open carriages on a short rail. */
export const item: ItemModel = {
  id: 'mini-train',
  name: 'ขบวนรถไฟเล็ก',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([BED.w, BED.h, 1.96], [0, BED.h / 2, 0], 'stoneDark')];
    for (let i = 0; i < 9; i++) parts.push(kit.box([0.44, 0.03, 0.07], [0, BED.h + 0.015, -0.88 + i * 0.22], 'woodDark'));
    for (const s of [1, -1]) parts.push(kit.box([0.035, 0.035, 1.9], [s * RAIL_X, RAIL_TOP - 0.0175, 0], 'chrome'));
    const chassisY = AXLE_Y + 0.03;
    const wheels = (z0: number, z1: number, spokes = 1) => {
      for (const s of [1, -1]) for (const z of [z0 + 0.12, z1 - 0.12]) {
        parts.push(...wheel(kit, { at: [s * RAIL_X, AXLE_Y, z], radius: WHEEL.r, tube: WHEEL.tube, axis: 'x', color: 'charcoal', spokes, spokeColor: 'sunYellow', tubularSegments: 8 }));
      }
    };
    // engine
    const ez = (ENGINE.z0 + ENGINE.z1) / 2;
    parts.push(
      kit.box([0.34, CHASSIS_T, ENGINE.z1 - ENGINE.z0], [0, chassisY, ez], 'charcoal'),
      kit.cylinder(0.12, 0.12, 0.4, [0, chassisY + CHASSIS_T / 2 + 0.12, ENGINE.z1 - 0.23], 'red', { rotate: [Math.PI / 2, 0, 0], segments: 10 }),
      kit.cylinder(0.125, 0.125, 0.03, [0, chassisY + CHASSIS_T / 2 + 0.12, ENGINE.z1 - 0.03], 'redDark', { rotate: [Math.PI / 2, 0, 0], segments: 10 }),
      kit.cylinder(0.04, 0.05, 0.14, [0, chassisY + 0.3, ENGINE.z1 - 0.12], 'charcoal', { segments: 8 }),
      kit.sphere(0.05, [0, chassisY + 0.4, ENGINE.z1 - 0.12], 'stone', { detail: 0 }),
      kit.sphere(0.045, [0, chassisY + 0.28, ENGINE.z1 - 0.38], 'sunYellow', { detail: 0 }),
      kit.sphere(0.035, [0, chassisY + 0.15, ENGINE.z1 + 0.0], 'lampWarm', { detail: 0, glow: true }),
      // cab
      kit.box([0.32, 0.26, 0.2], [0, chassisY + CHASSIS_T / 2 + 0.13, ENGINE.z0 + 0.12], 'blue'),
      kit.box([0.38, 0.04, 0.26], [0, chassisY + CHASSIS_T / 2 + 0.28, ENGINE.z0 + 0.12], 'redDark'),
    );
    wheels(ENGINE.z0, ENGINE.z1, 2);
    // carriages: floor, four low walls, a bench; each coupled to the next by a short bar
    for (const c of CARS) {
      const cz = (c.z0 + c.z1) / 2;
      const len = c.z1 - c.z0;
      parts.push(
        kit.box([0.34, CHASSIS_T, len], [0, chassisY, cz], 'charcoal'),
        kit.box([0.34, 0.2, 0.04], [0, chassisY + 0.125, c.z0 + 0.02], c.color),
        kit.box([0.34, 0.2, 0.04], [0, chassisY + 0.125, c.z1 - 0.02], c.color),
        kit.box([0.04, 0.2, len - 0.08], [0.15, chassisY + 0.125, cz], c.color),
        kit.box([0.04, 0.2, len - 0.08], [-0.15, chassisY + 0.125, cz], c.color),
        kit.box([0.22, 0.04, len - 0.3], [0, chassisY + 0.05, cz], 'wood'),
        kit.box([0.04, 0.03, 0.08], [0, chassisY, c.z1 + 0.03], 'stoneDark'),
      );
      wheels(c.z0, c.z1, 0);
    }
    return kit.finish(parts);
  },
};
