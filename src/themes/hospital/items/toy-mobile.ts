import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A baby mobile on a floor stand (1×1): a pole with a cap, and a crossed arm hung with stars and moons that
// turns slowly about the top of the pole. Every moving part shares the one pivot and speed.
const POLE_TOP = 1.18;
const SPIN: MotionOpts = { kind: 'spin', pivot: [0, POLE_TOP, 0], speed: 0.4 };
const ARM = 0.36; // arm half length (shapes hang at this radius, plus their size, inside 0.5)

/** An eight-point star made of two crossed flat boxes, centred at `at`. */
function star(kit: StyleKit, at: [number, number, number], c: PaletteColor): Part[] {
  return [
    kit.box([0.12, 0.12, 0.03], at, c, { motion: SPIN }),
    kit.box([0.12, 0.12, 0.03], at, c, { rotate: [0, 0, Math.PI / 4], motion: SPIN }),
  ];
}

/** โมบายของเล่น: a stand with a slowly turning mobile of stars and moons. */
export const item: ItemModel = {
  id: 'toy-mobile',
  name: 'โมบายของเล่น',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      // still: base, pole, cap and three toy blocks on the floor
      kit.cylinder(0.3, 0.3, 0.05, [0, 0.025, 0], 'wood', { segments: 12 }),
      kit.cylinder(0.04, 0.04, POLE_TOP - 0.05, [0, 0.05 + (POLE_TOP - 0.05) / 2, 0], 'white', { segments: 8 }),
      kit.sphere(0.055, [0, POLE_TOP, 0], 'teal', { detail: 0 }),
      kit.box([0.11, 0.11, 0.11], [0.36, 0.055, 0.3], 'red', { rotate: [0, 0.4, 0] }),
      kit.box([0.11, 0.11, 0.11], [0.3, 0.055, -0.33], 'blue', { rotate: [0, 0.2, 0] }),
      kit.box([0.11, 0.11, 0.11], [-0.35, 0.055, 0.3], 'sunYellow', { rotate: [0, 0.7, 0] }),
      // turning: two crossed arms (everything that turns hangs off an arm, clear of the still pole)
      kit.box([ARM * 2, 0.03, 0.03], [0, POLE_TOP, 0], 'wood', { motion: SPIN }),
      kit.box([0.03, 0.03, ARM * 2], [0, POLE_TOP, 0], 'wood', { motion: SPIN }),
    ];
    // the four hanging shapes (string, then a star or a crescent moon), at different drops
    const HANG: { x: number; z: number; drop: number; moon: boolean; c: PaletteColor }[] = [
      { x: ARM, z: 0, drop: 0.3, moon: false, c: 'sunYellow' },
      { x: 0, z: ARM, drop: 0.4, moon: true, c: 'purple' },
      { x: -ARM, z: 0, drop: 0.3, moon: false, c: 'pink' },
      { x: 0, z: -ARM, drop: 0.4, moon: true, c: 'skyBlue' },
    ];
    for (const h of HANG) {
      parts.push(kit.cylinder(0.008, 0.008, h.drop, [h.x, POLE_TOP - h.drop / 2, h.z], 'stoneDark', { segments: 4, motion: SPIN }));
      const at: [number, number, number] = [h.x, POLE_TOP - h.drop - 0.05, h.z];
      if (h.moon) parts.push(kit.torus(0.055, 0.025, at, h.c, { arc: 4.5, tubularSegments: 12, motion: SPIN, rotate: [0, Math.PI / 2, Math.PI * 0.2] }));
      else parts.push(...star(kit, at, h.c));
    }
    return kit.finish(parts);
  },
};
