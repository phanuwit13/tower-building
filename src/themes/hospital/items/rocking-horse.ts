import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { aim } from '../../../models/parts';

// A wooden rocking horse facing +x. It rocks about the CENTRE OF THE RUNNER ARC (a point CY above the floor on
// the z axis through the middle), so the arc turns onto itself: its lowest point stays on y = 0 and no part
// sinks through the floor at either end of the rock. One shared motion on every part of the horse and runners.
const RUN = { r: 0.36, tube: 0.03, z: 0.17, half: 0.9 }; // runner arc: centre-line radius, tube, side offset, half the arc angle
const CY = RUN.r + RUN.tube; // the arc's centre, so the arc's lowest point is at y = 0
const ROCK: MotionOpts = { kind: 'swing', pivot: [0, CY, 0], axis: [0, 0, 1], amount: 0.12, speed: 1.6 };

/** ม้าโยก: a wooden rocking horse; it rocks gently. */
export const item: ItemModel = {
  id: 'rocking-horse',
  name: 'ม้าโยก',
  category: 'play',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [];
    /** A cylinder from a to b that rocks with the horse (the kit's rod() cannot take motion). */
    const strut = (a: Vec3, b: Vec3, r: number, color: 'woodDark' | 'sand'): Part => {
      const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      return kit.cylinder(r, r, Math.hypot(...d), [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], color, { segments: 8, rotate: aim(d), motion: ROCK });
    };
    for (const sz of [-1, 1]) {
      const z = sz * RUN.z;
      // runner: an arc about the pivot, bottom at x = 0
      parts.push(kit.torus(RUN.r, RUN.tube, [0, CY, z], 'blue', { radialSegments: 4, tubularSegments: 8, arc: RUN.half * 2, rotate: [0, 0, -Math.PI / 2 - RUN.half], motion: ROCK }));
      for (const e of [-1, 1]) {
        const a = -Math.PI / 2 + e * RUN.half; // round off the end of the arc
        parts.push(kit.sphere(RUN.tube, [RUN.r * Math.cos(a), CY + RUN.r * Math.sin(a), z], 'blue', { detail: 0, motion: ROCK }));
      }
      // legs: from the runner up to the body, splayed a little
      const rx = 0.22;
      const ry = CY - Math.sqrt(RUN.r * RUN.r - rx * rx);
      for (const sx of [-1, 1]) parts.push(strut([sx * rx, ry, z], [sx * 0.17, 0.62, sz * 0.09], 0.032, 'woodDark'));
    }
    parts.push(
      kit.sphere(1, [-0.01, 0.66, 0], 'sand', { scale: [0.26, 0.14, 0.13], motion: ROCK }), // body
      kit.box([0.2, 0.03, 0.2], [-0.02, 0.805, 0], 'red', { motion: ROCK }), // saddle
      kit.box([0.04, 0.05, 0.2], [-0.13, 0.815, 0], 'red', { motion: ROCK }),
      kit.box([0.05, 0.05, 0.2], [0.08, 0.815, 0], 'red', { motion: ROCK }),
      strut([0.16, 0.7, 0], [0.25, 0.9, 0], 0.07, 'sand'), // neck
      kit.sphere(1, [0.31, 0.93, 0], 'sand', { scale: [0.13, 0.08, 0.07], rotate: [0, 0, -0.35], motion: ROCK }), // head
      kit.sphere(0.035, [0.39, 0.9, 0], 'pink', { detail: 0, motion: ROCK }), // nose
      kit.sphere(0.022, [0.35, 0.97, 0.058], 'charcoal', { detail: 0, motion: ROCK }), // eyes
      kit.sphere(0.022, [0.35, 0.97, -0.058], 'charcoal', { detail: 0, motion: ROCK }),
      kit.cone(0.04, 0.1, [0.26, 1.03, 0.05], 'sand', { segments: 4, motion: ROCK }), // ears
      kit.cone(0.04, 0.1, [0.26, 1.03, -0.05], 'sand', { segments: 4, motion: ROCK }),
      kit.box([0.04, 0.2, 0.05], [0.19, 0.88, 0], 'sunYellow', { rotate: [0, 0, 0.5], motion: ROCK }), // mane along the neck
      kit.sphere(1, [-0.29, 0.64, 0], 'sunYellow', { scale: [0.05, 0.12, 0.05], rotate: [0, 0, 0.5], motion: ROCK }), // tail
    );
    return kit.finish(parts);
  },
};
