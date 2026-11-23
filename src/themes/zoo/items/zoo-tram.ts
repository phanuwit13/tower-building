import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

// A little open tram (long side along z), engine at the +z end, one open carriage behind it. Both on
// small charcoal wheels. The engine has a striped canopy on four posts; the carriage has two benches.
const CHASSIS = { y: 0.13, h: 0.07, w: 0.56 };
const DECK = CHASSIS.y + CHASSIS.h / 2; // top of the chassis
const ENGINE = { z0: 0.18, z1: 0.94 };
const CARRIAGE = { z0: -0.94, z1: 0.1 };
const WHEEL_R = 0.1;

function wheels(kit: StyleKit, z: number): Part[] {
  const parts: Part[] = [];
  for (const side of [1, -1]) {
    parts.push(
      kit.cylinder(WHEEL_R, WHEEL_R, 0.06, [side * 0.28, WHEEL_R, z], 'charcoal', { rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.045, 0.045, 0.075, [side * 0.28, WHEEL_R, z], 'sunYellow', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
    );
  }
  return parts;
}

/** รถรางชมสวนสัตว์: an open tram with a striped-canopy engine and one open carriage. */
export const item: ItemModel = {
  id: 'zoo-tram',
  name: 'รถรางชมสวนสัตว์',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([CHASSIS.w, CHASSIS.h, ENGINE.z1 - ENGINE.z0], [0, CHASSIS.y, (ENGINE.z0 + ENGINE.z1) / 2], 'charcoal'),
      kit.box([CHASSIS.w, CHASSIS.h, CARRIAGE.z1 - CARRIAGE.z0], [0, CHASSIS.y, (CARRIAGE.z0 + CARRIAGE.z1) / 2], 'charcoal'),
      kit.box([0.1, 0.04, 0.1], [0, CHASSIS.y, 0.14], 'stoneDark'), // coupling
      ...wheels(kit, ENGINE.z0 + 0.17),
      ...wheels(kit, ENGINE.z1 - 0.17),
      ...wheels(kit, CARRIAGE.z0 + 0.17),
      ...wheels(kit, CARRIAGE.z1 - 0.17),
    ];
    // engine: green bonnet at the front, floor and a driver seat under the striped canopy
    parts.push(
      kit.box([0.5, 0.2, 0.34], [0, DECK + 0.1, ENGINE.z1 - 0.2], 'teal'),
      kit.box([0.52, 0.04, 0.36], [0, DECK + 0.22, ENGINE.z1 - 0.2], 'sunYellow'),
      kit.sphere(0.06, [0, DECK + 0.1, ENGINE.z1 - 0.03], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }),
      kit.box([0.5, 0.035, 0.42], [0, DECK + 0.02, ENGINE.z0 + 0.2], 'wood'),
      kit.box([0.4, 0.1, 0.12], [-0.02, DECK + 0.1, ENGINE.z0 + 0.12], 'orange'),
      kit.box([0.4, 0.2, 0.04], [-0.02, DECK + 0.18, ENGINE.z0 + 0.04], 'orange'),
    );
    const post = 0.52; // canopy post height above the deck
    for (const [px, pz] of [[0.22, ENGINE.z1 - 0.1], [-0.22, ENGINE.z1 - 0.1], [0.22, ENGINE.z0 + 0.03], [-0.22, ENGINE.z0 + 0.03]] as const) {
      parts.push(kit.cylinder(0.02, 0.02, post, [px, DECK + post / 2, pz], 'white', { segments: 6 }));
    }
    const cz = (ENGINE.z0 + ENGINE.z1) / 2 + 0.02;
    parts.push(
      // striped canopy: two six-sided cones turned half a segment apart give alternating stripes
      kit.cone(0.36, 0.17, [0, DECK + post + 0.085, cz], 'red', { segments: 6 }),
      kit.cone(0.36, 0.17, [0, DECK + post + 0.085, cz], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0] }),
      kit.sphere(0.03, [0, DECK + post + 0.18, cz], 'sunYellow', { detail: 0 }),
    );
    // carriage: low sides, two benches and a stripe of colour
    const mid = (CARRIAGE.z0 + CARRIAGE.z1) / 2;
    const len = CARRIAGE.z1 - CARRIAGE.z0;
    parts.push(
      kit.box([0.5, 0.03, len - 0.04], [0, DECK + 0.015, mid], 'wood'),
      kit.box([0.03, 0.15, len], [0.265, DECK + 0.075, mid], 'orange'),
      kit.box([0.03, 0.15, len], [-0.265, DECK + 0.075, mid], 'orange'),
      kit.box([0.56, 0.15, 0.03], [0, DECK + 0.075, CARRIAGE.z0 + 0.015], 'orange'),
      kit.box([0.56, 0.15, 0.03], [0, DECK + 0.075, CARRIAGE.z1 - 0.015], 'orange'),
    );
    for (const z of [mid - 0.28, mid + 0.22]) {
      parts.push(
        kit.box([0.4, 0.07, 0.15], [0, DECK + 0.1, z], 'sunYellow'),
        kit.box([0.4, 0.16, 0.035], [0, DECK + 0.2, z - 0.07], 'sunYellow'),
      );
    }
    return kit.finish(parts);
  },
};
