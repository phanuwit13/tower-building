import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// An old market scale (1×1): a wooden crate with a brass pillar, a balance beam along z and two
// hanging pans; one holds fruit, the other round iron weights.
const CRATE = { w: 0.56, h: 0.3, d: 0.56 };
const BEAM_Y = 0.82;
const PAN = { z: 0.3, y: 0.5, r: 0.15 };

/** ตาชั่งตลาด: an old market scale on a crate with fruit on the pan. */
export const item: ItemModel = {
  id: 'market-scale',
  name: 'ตาชั่งตลาด',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([CRATE.w, CRATE.h, CRATE.d], [0, CRATE.h / 2, 0], 'wood'),
      kit.box([CRATE.w + 0.02, 0.05, CRATE.d + 0.02], [0, 0.025, 0], 'woodDark'),
      kit.box([CRATE.w + 0.02, 0.05, CRATE.d + 0.02], [0, CRATE.h - 0.025, 0], 'woodDark'),
      kit.box([CRATE.w + 0.02, 0.03, 0.06], [0, CRATE.h / 2, 0], 'woodDark'),
      kit.cylinder(0.05, 0.07, 0.1, [0, CRATE.h + 0.05, 0], 'brass', { segments: 8 }),
      kit.cylinder(0.03, 0.03, BEAM_Y - CRATE.h - 0.1, [0, (CRATE.h + 0.1 + BEAM_Y) / 2, 0], 'brass', { segments: 8 }),
      kit.sphere(0.05, [0, BEAM_Y, 0], 'sunYellow', { detail: 0 }),
      kit.box([0.04, 0.035, PAN.z * 2 + 0.04], [0, BEAM_Y, 0], 'brass'),
    ];
    for (const sz of [-1, 1]) {
      const z = sz * PAN.z;
      // three ropes from the beam end down to the rim of the pan
      for (const a of [0, 2.1, 4.2]) {
        parts.push(rod(kit, [0, BEAM_Y - 0.02, z], [0.12 * Math.cos(a), PAN.y + 0.02, z + 0.12 * Math.sin(a)], 0.008, 'stoneDark', { segments: 4 }));
      }
      parts.push(kit.cylinder(PAN.r, PAN.r - 0.04, 0.03, [0, PAN.y, z], 'chrome', { segments: 10 }), kit.sphere(0.03, [0, BEAM_Y - 0.02, z], 'brass', { detail: 0 }));
    }
    // fruit on the +z pan, two iron weights on the -z pan
    const fy = PAN.y + 0.015;
    parts.push(
      kit.sphere(0.06, [0.05, fy + 0.06 * 0.851, PAN.z - 0.04], 'orange', { detail: 0 }),
      kit.sphere(0.06, [-0.05, fy + 0.06 * 0.851, PAN.z + 0.04], 'red', { detail: 0 }),
      kit.sphere(0.05, [0.05, fy + 0.05 * 0.851, PAN.z + 0.08], 'lime', { detail: 0 }),
      kit.sphere(0.05, [0, fy + 0.12 + 0.02, PAN.z], 'sunYellow', { detail: 0 }),
      kit.cylinder(0.05, 0.06, 0.07, [0.03, fy + 0.035, -PAN.z], 'charcoal', { segments: 8 }),
      kit.cylinder(0.035, 0.04, 0.06, [-0.07, fy + 0.03, -PAN.z + 0.03], 'charcoal', { segments: 8 }),
    );
    // a little lantern on the crate
    parts.push(
      kit.cylinder(0.05, 0.05, 0.03, [-0.17, CRATE.h + 0.015, -0.12], 'charcoal', { segments: 8 }),
      kit.sphere(0.07, [-0.17, CRATE.h + 0.03 + 0.07, -0.12], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }),
      kit.cone(0.06, 0.04, [-0.17, CRATE.h + 0.03 + 0.15, -0.12], 'charcoal', { segments: 8 }),
    );
    // a spare mango sitting on the crate
    parts.push(kit.sphere(0.07, [0.17, CRATE.h + 0.07 * 0.9 * 0.851 + 0.003, 0.17], 'sunYellow', { detail: 0, scale: [1, 0.9, 1.2] }));
    return kit.finish(parts);
  },
};
