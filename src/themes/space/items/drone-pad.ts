import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import type { MotionOpts } from '../../../models/motion';

const SLAB = { x: 0.96, z: 1.96, h: 0.04 };
const DRONES: ReadonlyArray<{ z: number; body: PaletteColor; spins: boolean }> = [
  { z: 0.5, body: 'orange', spins: false }, // parked, rotor still
  { z: -0.5, body: 'teal', spins: true }, // warming up, rotor turning
];

/** Builds one little rotor drone centred on (0, z): pod body, skids, tail and a rotor on a mast. */
function drone(kit: Parameters<ItemModel['build']>[0], z: number, body: PaletteColor, spins: boolean): Part[] {
  const y0 = SLAB.h;
  const MAST_TOP = 0.5;
  // ONE pivot for the whole rotor of this drone: the top of its mast
  const spin: MotionOpts | undefined = spins ? { kind: 'spin', pivot: [0, MAST_TOP, z], axis: [0, 1, 0], speed: 0.9 } : undefined;
  const at = (x: number, y: number, dz = 0): Vec3 => [x, y0 + y, z + dz];
  return [
    kit.sphere(0.2, at(0, 0.22), body, { detail: 1, scale: [1, 0.85, 1.15] }),
    kit.sphere(0.07, at(0.15, 0.22, 0.1), 'skyBlue', { detail: 0 }), // camera eye
    kit.box([0.04, 0.05, 0.5], at(0.17, 0.04), 'charcoal'), // skids
    kit.box([0.04, 0.05, 0.5], at(-0.17, 0.04), 'charcoal'),
    kit.box([0.04, 0.12, 0.04], at(0.17, 0.09, 0.14), 'charcoal'),
    kit.box([0.04, 0.12, 0.04], at(-0.17, 0.09, 0.14), 'charcoal'),
    kit.box([0.04, 0.12, 0.04], at(0.17, 0.09, -0.14), 'charcoal'),
    kit.box([0.04, 0.12, 0.04], at(-0.17, 0.09, -0.14), 'charcoal'),
    kit.box([0.06, 0.06, 0.26], at(0, 0.24, -0.26), 'white'), // tail boom
    kit.box([0.03, 0.16, 0.1], at(0, 0.3, -0.38), 'sunYellow'), // tail fin
    kit.cylinder(0.03, 0.04, MAST_TOP - 0.36, at(0, (MAST_TOP + 0.36) / 2), 'stoneDark', { segments: 6 }),
    // the rotor: two blades and a hub, all on the same pivot, clear above the body
    kit.box([0.8, 0.025, 0.08], at(0, MAST_TOP + 0.03), 'sunYellow', { motion: spin }),
    kit.box([0.08, 0.025, 0.8], at(0, MAST_TOP + 0.03), 'sunYellow', { motion: spin }),
    kit.cylinder(0.06, 0.06, 0.06, at(0, MAST_TOP + 0.01), 'red', { segments: 8, motion: spin }),
  ];
}

/** ลานโดรน: a landing pad with two drones, one with turning rotors. */
export const item: ItemModel = {
  id: 'drone-pad',
  name: 'ลานโดรน',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([SLAB.x, SLAB.h, SLAB.z], [0, SLAB.h / 2, 0], 'stone')];
    for (const d of DRONES) {
      // painted landing ring under each drone
      parts.push(kit.torus(0.4, 0.02, [0, SLAB.h + 0.02, d.z], 'sunYellow', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 16 }));
      parts.push(...drone(kit, d.z, d.body, d.spins));
    }
    // corner markers and a charging box
    for (const [x, z] of [[0.4, 0.9], [-0.4, 0.9], [0.4, -0.9], [-0.4, -0.9]]) {
      parts.push(kit.box([0.08, 0.06, 0.08], [x, SLAB.h + 0.03, z], 'orange'));
    }
    parts.push(kit.box([0.12, 0.14, 0.2], [-0.38, SLAB.h + 0.07, 0], 'blue'), kit.box([0.02, 0.06, 0.1], [-0.31, SLAB.h + 0.09, 0], 'lampWarm', { glow: true }));
    return kit.finish(parts);
  },
};
