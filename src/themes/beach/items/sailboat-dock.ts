import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

const W = 1.96; // model size along x
const D = 2.96; // and along z
const SEA = { x0: -0.98, x1: 0.3, h: 0.06 }; // the water patch: x from the open sea to the shore
const SHORE_H = 0.04; // sand beach, higher than the 0.02 floor-tile limit
const WATER: MotionOpts = { kind: 'water', water: 'pond' };
// jetty: a plank deck on posts, running out from the shore along -x
const JETTY = { x0: -0.75, x1: 0.75, z: 0.0, w: 0.34, y: 0.2, t: 0.04 };
// sailboat, bow towards the open sea (-x), moored on the -z side of the jetty
const BOAT = { x: -0.3, z: -0.46, y: 0.16, rx: 0.5, ry: 0.15, rz: 0.19, deck: 0.29 };
const MAST = { x: -0.42, base: 0.28, top: 1.58, r: 0.025 };
const SAIL_BASE = 0.46; // bottom of the sails (the boom)
const STRIP = 0.09; // cloth is cut in vertical strips so the ripple runs along it
const WAVE_MAIN: MotionOpts = { kind: 'wave', pivot: [MAST.x, SAIL_BASE, BOAT.z], axis: [1, 0, 0] };
const WAVE_JIB: MotionOpts = { kind: 'wave', pivot: [MAST.x, SAIL_BASE, BOAT.z], axis: [-1, 0, 0] };
const WAVE_FLAG: MotionOpts = { kind: 'wave', pivot: [MAST.x, MAST.top, BOAT.z], axis: [1, 0, 0] };

/** เรือใบจอดท่า: a small jetty with a sailboat moored beside it; the sail cloth ripples. */
export const item: ItemModel = {
  id: 'sailboat-dock',
  name: 'เรือใบจอดท่า',
  category: 'vehicle',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const seaW = SEA.x1 - SEA.x0;
    const shoreW = W / 2 - SEA.x1 + 0.02;
    const parts: Part[] = [
      kit.box([seaW, SEA.h, D], [(SEA.x0 + SEA.x1) / 2, SEA.h / 2, 0], 'navy', { motion: WATER }),
      kit.box([shoreW, SHORE_H, D], [W / 2 - shoreW / 2, SHORE_H / 2, 0], 'sand'),
    ];

    // jetty: 12 cross planks in two woods, posts on both sides
    const jl = JETTY.x1 - JETTY.x0;
    const planks = 12;
    for (let i = 0; i < planks; i++) {
      parts.push(kit.box([jl / planks - 0.01, JETTY.t, JETTY.w], [JETTY.x0 + (i + 0.5) * (jl / planks), JETTY.y + JETTY.t / 2, JETTY.z], i % 2 ? 'woodDark' : 'wood'));
    }
    for (const x of [-0.7, -0.2, 0.3]) {
      for (const s of [-1, 1]) parts.push(kit.box([0.07, 0.3, 0.07], [x, 0.15, JETTY.z + s * (JETTY.w / 2 - 0.02)], 'woodDark'));
    }
    parts.push(kit.sphere(0.05, [-0.7, 0.33, JETTY.z - JETTY.w / 2 + 0.02], 'red', { detail: 0 }), // mooring post cap

      // hull (a squashed ball), deck, cabin
      kit.sphere(1, [BOAT.x, BOAT.y, BOAT.z], 'red', { scale: [BOAT.rx, BOAT.ry, BOAT.rz] }),
      kit.box([0.62, 0.03, 0.2], [BOAT.x, BOAT.deck, BOAT.z], 'wood'),
      kit.box([0.2, 0.08, 0.14], [-0.02, BOAT.deck + 0.055, BOAT.z], 'white'),
      kit.box([0.2, 0.02, 0.15], [-0.02, BOAT.deck + 0.1, BOAT.z], 'teal'),
      // mast and boom
      kit.cylinder(MAST.r, MAST.r, MAST.top - MAST.base, [MAST.x, (MAST.top + MAST.base) / 2, BOAT.z], 'woodDark', { segments: 8 }),
      kit.box([0.6, 0.03, 0.03], [MAST.x + 0.3, SAIL_BASE - 0.015, BOAT.z], 'woodDark'),
      // mooring rope from the jetty post to the hull
      rod(kit, [-0.2, 0.26, JETTY.z - JETTY.w / 2 + 0.02], [-0.2, 0.25, BOAT.z + 0.19], 0.015, 'sand', { segments: 4 }),
    );

    // main sail (aft of the mast, getting lower towards the stern) and jib (forward)
    for (let i = 0; i < 6; i++) {
      const h = 1.0 * (1 - (i + 0.4) / 6.2);
      parts.push(kit.box([STRIP, h, 0.02], [MAST.x + 0.03 + (i + 0.5) * STRIP, SAIL_BASE + h / 2, BOAT.z], 'white', { motion: WAVE_MAIN }));
    }
    for (let i = 0; i < 3; i++) {
      const h = 0.78 * (1 - (i + 0.4) / 3.4);
      parts.push(kit.box([STRIP, h, 0.02], [MAST.x - 0.03 - (i + 0.5) * STRIP, SAIL_BASE + 0.06 + h / 2 + 0.0, BOAT.z], 'sunYellow', { motion: WAVE_JIB }));
    }
    for (let i = 0; i < 2; i++) {
      parts.push(kit.box([0.05, 0.07, 0.015], [MAST.x + 0.03 + (i + 0.5) * 0.05, MAST.top - 0.05, BOAT.z], 'red', { motion: WAVE_FLAG }));
    }

    // a buoy floating in the water, on the far side
    parts.push(
      kit.sphere(0.07, [-0.55, SEA.h + 0.04, 1.05], 'orange', { detail: 0 }),
      kit.cylinder(0.02, 0.02, 0.1, [-0.55, SEA.h + 0.13, 1.05], 'white', { segments: 6 }),
    );
    return kit.finish(parts);
  },
};
