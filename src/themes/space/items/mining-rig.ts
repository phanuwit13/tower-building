import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A drilling rig: an orange derrick on a stone pad. The drill (shaft, fins and bit) turns about its own
// vertical axis, one shared pivot. Beside it a control cabin and a pile of shiny, colourful ore.
const PAD_TOP = 0.1;
const RIG = { x: -0.2, z: -0.55 };
const LEG = 0.32; // legs at +-LEG from the rig axis
const TOP = 1.4; // top of the legs
const SPIN: MotionOpts = { kind: 'spin', pivot: [RIG.x, 0, RIG.z], axis: [0, 1, 0], speed: 0.5 };
const ICO = 0.851;
const PILE: { x: number; y: number; z: number; r: number; color: PaletteColor }[] = [
  { x: 0.4, y: 0, z: 0.85, r: 0.16, color: 'purple' },
  { x: 0.7, y: 0, z: 1.05, r: 0.14, color: 'pink' },
  { x: 0.1, y: 0, z: 1.1, r: 0.13, color: 'skyBlue' },
  { x: 0.7, y: 0, z: 0.7, r: 0.12, color: 'sunYellow' },
  { x: 0.4, y: 0, z: 1.2, r: 0.12, color: 'lime' },
  { x: 0.55, y: 0.2, z: 0.95, r: 0.13, color: 'mint' },
  { x: 0.3, y: 0.22, z: 1.0, r: 0.11, color: 'orange' },
  { x: 0.45, y: 0.36, z: 0.9, r: 0.09, color: 'white' },
];

/** แท่นขุดแร่: a drilling rig with a turning drill and a pile of shiny ore. */
export const item: ItemModel = {
  id: 'mining-rig',
  name: 'แท่นขุดแร่',
  category: 'facility',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.9, PAD_TOP, 2.9], [0, PAD_TOP / 2, 0], 'stone'),
      kit.cylinder(0.3, 0.3, 0.03, [RIG.x, PAD_TOP + 0.015, RIG.z], 'charcoal', { segments: 12 }), // the hole
    ];
    // derrick: four legs, two braces, a top plate and a motor
    for (const dx of [-LEG, LEG]) for (const dz of [-LEG, LEG]) {
      parts.push(kit.box([0.08, TOP - PAD_TOP, 0.08], [RIG.x + dx, (TOP + PAD_TOP) / 2, RIG.z + dz], 'orange'));
    }
    for (const y of [0.6, 1.05]) {
      for (const d of [-LEG, LEG]) {
        parts.push(
          kit.box([2 * LEG, 0.05, 0.05], [RIG.x, y, RIG.z + d], 'sunYellow'),
          kit.box([0.05, 0.05, 2 * LEG], [RIG.x + d, y + 0.0, RIG.z], 'sunYellow'),
        );
      }
    }
    parts.push(
      kit.box([0.8, 0.1, 0.8], [RIG.x, TOP + 0.05, RIG.z], 'teal'),
      kit.cylinder(0.1, 0.1, 0.1, [RIG.x, TOP + 0.15, RIG.z], 'charcoal', { segments: 8 }), // still stub
      // drive wheel on top of the plate, seen from the camera: white disc, red bar, yellow knob and pink paddle,
      // all turning about the drill axis (reach 0.3 from the axis: inside the 0.4 plate, nothing still above it)
      kit.cylinder(0.3, 0.3, 0.04, [RIG.x, TOP + 0.22, RIG.z], 'white', { segments: 12, motion: SPIN }),
      kit.box([0.56, 0.05, 0.12], [RIG.x, TOP + 0.265, RIG.z], 'red', { motion: SPIN }),
      kit.box([0.12, 0.05, 0.26], [RIG.x, TOP + 0.265, RIG.z + 0.13], 'pink', { motion: SPIN }),
      kit.sphere(0.06, [RIG.x + 0.2, TOP + 0.32, RIG.z], 'sunYellow', { detail: 0, motion: SPIN }),
    );
    // the drill: everything below turns with the same pivot
    parts.push(
      kit.cylinder(0.05, 0.05, 0.85, [RIG.x, 0.975, RIG.z], 'chrome', { segments: 8, motion: SPIN }),
      // paddles below the plate, off-centre so the turn reads; clear of the legs (inner face 0.28 from the axis)
      kit.box([0.44, 0.05, 0.12], [RIG.x, 1.25, RIG.z], 'red', { motion: SPIN }),
      kit.box([0.12, 0.05, 0.3], [RIG.x, 1.1, RIG.z + 0.1], 'sunYellow', { motion: SPIN }),
      kit.box([0.3, 0.05, 0.12], [RIG.x + 0.1, 0.95, RIG.z], 'pink', { motion: SPIN }),
      kit.cylinder(0.16, 0, 0.42, [RIG.x, 0.34, RIG.z], 'orange', { segments: 6, motion: SPIN }),
      kit.cylinder(0.16, 0, 0.42, [RIG.x, 0.34, RIG.z], 'sunYellow', { segments: 6, rotate: [0, Math.PI / 6, 0], motion: SPIN }),
    );
    // control cabin
    parts.push(
      kit.box([0.6, 0.5, 0.5], [0.55, PAD_TOP + 0.25, -1.05], 'white'),
      kit.box([0.66, 0.06, 0.56], [0.55, PAD_TOP + 0.53, -1.05], 'orange'),
      kit.box([0.02, 0.2, 0.3], [0.86, PAD_TOP + 0.3, -1.05], 'skyBlue'),
      kit.box([0.3, 0.2, 0.02], [0.55, PAD_TOP + 0.3, -0.79], 'skyBlue'),
    );
    // ore pile
    for (const o of PILE) {
      parts.push(kit.sphere(o.r, [o.x, PAD_TOP + o.y + o.r * ICO, o.z], o.color, { detail: 0 }));
    }
    parts.push(
      kit.box([0.04, 0.04, 0.04], [0.62, 0.52, 0.8], 'white', { rotate: [0.6, 0.6, 0] }),
      kit.box([0.04, 0.04, 0.04], [0.28, 0.4, 0.9], 'white', { rotate: [0.6, 0.6, 0] }),
      kit.box([0.04, 0.04, 0.04], [0.78, 0.3, 1.0], 'white', { rotate: [0.6, 0.6, 0] }),
    );
    return kit.finish(parts);
  },
};
