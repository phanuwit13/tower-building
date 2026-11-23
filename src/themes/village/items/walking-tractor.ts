import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod, wheel } from '../../../models/parts';

// Two-wheel walking tractor (engine and big wheels at z = 0.15, handles reaching back to +z) towing a small trailer at -z.
const BIG = { r: 0.22, tube: 0.06, x: 0.3, z: 0.15 };
const SMALL = { r: 0.12, tube: 0.04, x: 0.4, z: -0.6 };
const BED = { w: 0.66, l: 0.8, y: 0.27, z: -0.58 };

/** รถไถเดินตาม: a walking tractor with long handles and a small trailer. */
export const item: ItemModel = {
  id: 'walking-tractor',
  name: 'รถไถเดินตาม',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const sx of [-1, 1]) {
      parts.push(
        ...wheel(kit, { at: [sx * BIG.x, BIG.r + BIG.tube, BIG.z], radius: BIG.r, tube: BIG.tube, axis: 'x', color: 'charcoal', hubColor: 'sunYellow', hubRadius: 0.05, hubLength: 0.06, spokeColor: 'orange', tubularSegments: 12 }),
        ...wheel(kit, { at: [sx * SMALL.x, SMALL.r + SMALL.tube, SMALL.z], radius: SMALL.r, tube: SMALL.tube, axis: 'x', color: 'charcoal', hubColor: 'sunYellow', hubRadius: 0.04, hubLength: 0.05, spokeColor: 'orange', tubularSegments: 12 }),
      );
    }
    parts.push(
      // axle, engine, tank, exhaust
      kit.cylinder(0.03, 0.03, 0.6, [0, 0.28, BIG.z], 'stoneDark', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.box([0.3, 0.26, 0.42], [0, 0.45, 0.13], 'red'),
      kit.box([0.32, 0.05, 0.44], [0, 0.6, 0.13], 'redDark'),
      kit.sphere(0.11, [0, 0.7, 0.04], 'sunYellow', { detail: 1, scale: [1, 0.8, 1.2] }), // fuel tank
      kit.cylinder(0.035, 0.035, 0.3, [-0.1, 0.78, 0.25], 'charcoal', { segments: 8 }), // exhaust
      kit.cylinder(0.14, 0.14, 0.04, [0.18, 0.46, 0.13], 'chrome', { segments: 10, rotate: [0, 0, Math.PI / 2] }), // flywheel
      kit.sphere(0.04, [0, 0.3, -0.12], 'lampWarm', { detail: 0, glow: true }),
    );
    // long handles back to +z with grips
    for (const sx of [-1, 1]) {
      parts.push(
        rod(kit, [sx * 0.1, 0.42, 0.3], [sx * 0.2, 0.78, 0.92], 0.025, 'woodDark'),
        kit.cylinder(0.035, 0.035, 0.12, [sx * 0.2, 0.78, 0.94], 'redDark', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      );
    }
    parts.push(rod(kit, [-0.17, 0.6, 0.62], [0.17, 0.6, 0.62], 0.02, 'woodDark', { segments: 4 }));
    // trailer: bed, low sides, straw load, hitch
    parts.push(
      kit.box([BED.w, 0.06, BED.l], [0, BED.y, BED.z], 'wood'),
      kit.box([0.04, 0.13, BED.l], [BED.w / 2 - 0.02, BED.y + 0.095, BED.z], 'woodDark'),
      kit.box([0.04, 0.13, BED.l], [-BED.w / 2 + 0.02, BED.y + 0.095, BED.z], 'woodDark'),
      kit.box([BED.w, 0.13, 0.04], [0, BED.y + 0.095, BED.z - BED.l / 2 + 0.02], 'woodDark'),
      kit.box([BED.w, 0.13, 0.04], [0, BED.y + 0.095, BED.z + BED.l / 2 - 0.02], 'woodDark'),
      kit.dome(0.3, [0, BED.y + 0.03, BED.z], 'sunYellow', { segments: 8, scale: [1, 0.6, 1.2] }),
      kit.cylinder(0.025, 0.025, 0.7, [0, SMALL.r + SMALL.tube, SMALL.z], 'stoneDark', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      rod(kit, [0, 0.3, BED.z + BED.l / 2], [0, 0.32, BIG.z - 0.15], 0.025, 'charcoal'),
    );
    return kit.finish(parts);
  },
};
