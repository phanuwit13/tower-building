import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A wooden coat stand: a hat on top, a scarf on the +z hook and an umbrella on the -z hook.
const POLE_TOP = 1.38;
const ARM_Y = 1.12;
const ARM = 0.32;

/** ราวแขวนเสื้อ: a coat stand with a hat, a scarf and an umbrella. */
export const item: ItemModel = {
  id: 'coat-rack',
  name: 'ราวแขวนเสื้อ',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.26, 0.28, 0.05, [0, 0.025, 0], 'woodDark', { segments: 10 }),
      kit.cylinder(0.04, 0.05, POLE_TOP - 0.05, [0, 0.05 + (POLE_TOP - 0.05) / 2, 0], 'wood', { segments: 8 }),
      kit.cylinder(0.06, 0.06, 0.05, [0, 0.62, 0], 'brass', { segments: 8 }),
    ];
    // four arms with brass knobs
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      parts.push(
        rod(kit, [dx * 0.03, ARM_Y - 0.1, dz * 0.03], [dx * ARM, ARM_Y, dz * ARM], 0.025, 'woodDark', { segments: 6 }),
        kit.sphere(0.045, [dx * ARM, ARM_Y + 0.03, dz * ARM], 'brass', { detail: 0 }),
      );
    }
    // hat on the top
    parts.push(
      kit.sphere(0.05, [0, POLE_TOP + 0.03, 0], 'brass', { detail: 0 }),
      kit.cylinder(0.17, 0.17, 0.025, [0, POLE_TOP + 0.04, 0], 'red', { segments: 12 }),
      kit.cylinder(0.1, 0.1, 0.12, [0, POLE_TOP + 0.11, 0], 'red', { segments: 12 }),
      kit.cylinder(0.105, 0.105, 0.035, [0, POLE_TOP + 0.08, 0], 'sunYellow', { segments: 12 }),
    );
    // scarf on the +z arm (striped, two tails)
    const sz = ARM;
    parts.push(
      kit.box([0.1, 0.05, 0.09], [0, ARM_Y + 0.065, sz], 'pink'),
      kit.box([0.1, 0.34, 0.04], [0, ARM_Y - 0.14, sz + 0.035], 'pink'),
      kit.box([0.1, 0.34, 0.04], [0, ARM_Y - 0.14, sz - 0.035], 'pink'),
      kit.box([0.105, 0.05, 0.1], [0, ARM_Y - 0.2, sz], 'white'),
      kit.box([0.105, 0.05, 0.1], [0, ARM_Y - 0.05, sz], 'white'),
      kit.box([0.105, 0.035, 0.1], [0, ARM_Y - 0.31, sz], 'purple'),
    );
    // umbrella hanging by its handle from the -z arm
    const uz = -ARM;
    parts.push(
      kit.torus(0.035, 0.015, [0, ARM_Y + 0.03, uz], 'woodDark', { radialSegments: 4, tubularSegments: 8, rotate: [0, Math.PI / 2, 0] }),
      kit.cylinder(0.02, 0.02, 0.1, [0, ARM_Y - 0.05, uz], 'woodDark', { segments: 6 }),
      kit.cylinder(0.055, 0.02, 0.5, [0, ARM_Y - 0.35, uz], 'blue', { segments: 8 }),
      kit.cylinder(0.03, 0.055, 0.1, [0, ARM_Y - 0.65, uz], 'navy', { segments: 8 }),
      kit.cylinder(0.052, 0.052, 0.03, [0, ARM_Y - 0.2, uz], 'sunYellow', { segments: 8 }),
    );
    return kit.finish(parts);
  },
};
