import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A colourful inflatable raft floating in a patch of shallow sea (sand rim, navy water). The water shimmers;
// the raft itself holds still on top.
const RIM = 0.03;
const WATER_TOP = 0.07;
const SEA: MotionOpts = { kind: 'water', water: 'pond' };
const TUBE = { r: 0.1, len: 1.25, off: 0.55 }; // four tubes make the square raft
const TUBE_Y = WATER_TOP + 0.06;
const TUBE_COLORS: PaletteColor[] = ['orange', 'sunYellow', 'pink', 'lime'];

/** แพเป่าลมในน้ำตื้น: an inflatable raft with four coloured tubes and a pad, floating in shallow water. */
export const item: ItemModel = {
  id: 'float-raft',
  name: 'แพเป่าลมในน้ำตื้น',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.96, RIM, 1.96], [0, RIM / 2, 0], 'sand'),
      kit.box([1.8, WATER_TOP - RIM, 1.8], [0, (WATER_TOP + RIM) / 2, 0], 'navy', { motion: SEA }),
      kit.box([1.0, 0.05, 1.0], [0, TUBE_Y, 0], 'mint'), // the pad
    ];
    // tubes: two along z (at x = ±off), two along x (at z = ±off); each corner joins the next tube
    ([[TUBE.off, 0], [0, TUBE.off], [-TUBE.off, 0], [0, -TUBE.off]] as const).forEach(([x, z], i) => {
      parts.push(kit.cylinder(TUBE.r, TUBE.r, TUBE.len, [x, TUBE_Y + 0.02, z], TUBE_COLORS[i], { segments: 8, rotate: x !== 0 ? [Math.PI / 2, 0, 0] : [0, 0, Math.PI / 2] }));
    });
    // rounded end caps where tubes meet, and two grab handles
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push(kit.sphere(0.1, [sx * TUBE.off, TUBE_Y + 0.02, sz * TUBE.off], TUBE_COLORS[(sx + sz + 4) % 4], { detail: 0 }));
    for (const s of [-1, 1]) parts.push(kit.torus(0.07, 0.02, [s * 0.15, TUBE_Y + 0.05, 0.0], 'white', { rotate: [Math.PI / 2, 0, 0], radialSegments: 4, tubularSegments: 8 }));
    return kit.finish(parts);
  },
};
