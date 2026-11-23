import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A market stall under a big striped umbrella (1×2, front on +x): a long table of folded
// umbrellas, a stand of colourful ones, and a ring of glowing bulbs round the canopy edge.
// The canopy sways a little about the top of the pole.
const TABLE = { x: 0.2, w: 0.32, d: 1.7, h: 0.32 };
const POLE = { x: -0.02, z: 0, h: 1.1 };
const CANOPY = { r: 0.46, h: 0.3, y: 1.1 };
const SWAY: MotionOpts = { kind: 'sway', pivot: [POLE.x, POLE.h - 0.05, POLE.z], amount: 0.06 };
const FOLDED: PaletteColor[] = ['pink', 'blue', 'lime', 'orange', 'purple', 'sunYellow'];

/** แผงร่มตลาด: an umbrella stall with folded umbrellas on a table and a bulb ring. */
export const item: ItemModel = {
  id: 'umbrella-stall',
  name: 'แผงร่มตลาด',
  category: 'building',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const top = TABLE.h + 0.04;
    const parts: Part[] = [
      kit.box([TABLE.w, TABLE.h, TABLE.d], [TABLE.x, TABLE.h / 2, 0], 'wood'),
      kit.box([TABLE.w + 0.04, 0.04, TABLE.d + 0.04], [TABLE.x, TABLE.h + 0.02, 0], 'white'),
      kit.cylinder(0.11, 0.13, 0.08, [POLE.x, 0.04, POLE.z], 'stone', { segments: 10 }),
      kit.cylinder(0.025, 0.025, POLE.h, [POLE.x, POLE.h / 2, POLE.z], 'charcoal', { segments: 6 }),
      // striped canopy: two six-sided cones half a segment apart
      kit.cone(CANOPY.r, CANOPY.h, [POLE.x, CANOPY.y + CANOPY.h / 2, POLE.z], 'red', { segments: 6, motion: SWAY }),
      kit.cone(CANOPY.r, CANOPY.h, [POLE.x, CANOPY.y + CANOPY.h / 2, POLE.z], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0], scale: [0.99, 1.01, 0.99], motion: SWAY }),
      kit.sphere(0.04, [POLE.x, CANOPY.y + CANOPY.h + 0.03, POLE.z], 'sunYellow', { detail: 0, motion: SWAY }),
    ];
    // folded umbrellas lying along the table, tips towards +z
    FOLDED.forEach((color, i) => {
      const z = -0.6 + i * 0.26;
      parts.push(
        kit.cylinder(0.0, 0.045, 0.3, [TABLE.x - 0.05 + (i % 2) * 0.1, top + 0.045, z], color, { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
        kit.cylinder(0.012, 0.012, 0.14, [TABLE.x - 0.05 + (i % 2) * 0.1, top + 0.045, z - 0.22], 'woodDark', { segments: 4, rotate: [Math.PI / 2, 0, 0] }),
      );
    });
    // a little stand at the back with three open child umbrellas
    for (const [i, z] of [-0.72, 0.0, 0.72].entries()) {
      const color = FOLDED[(i * 2 + 1) % FOLDED.length];
      parts.push(
        kit.cylinder(0.015, 0.015, 0.5, [-0.33, 0.25, z], 'charcoal', { segments: 4 }),
        kit.cone(0.15, 0.1, [-0.33, 0.55, z], color, { segments: 8 }),
      );
    }
    // glowing bulbs round the canopy edge, in three colours
    const BULB_COLORS: PaletteColor[] = ['lampWarm', 'pink', 'skyBlue'];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      parts.push(kit.sphere(0.04, [POLE.x + 0.44 * Math.cos(a), CANOPY.y - 0.01, POLE.z + 0.44 * Math.sin(a)], BULB_COLORS[i % 3], { detail: 0, glow: true, light: 'breathe' }));
    }
    return kit.finish(parts);
  },
};
