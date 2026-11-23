import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// A beach umbrella over a woven mat (1×2, long side along z) with a bag and a pair of sandals. The canopy sways a little.
const MAT = { w: 0.78, len: 1.8, t: 0.03, strips: 9 };
const POLE = { x: 0, z: -0.45, h: 1.3, r: 0.025 };
const CANOPY = { r: 0.47, h: 0.3, segments: 8 };
const SWAY: MotionOpts = { kind: 'sway', pivot: [POLE.x, POLE.h, POLE.z], amount: 0.3 };

/** ร่มชายหาดกับเสื่อ: a striped umbrella over a woven mat, with a bag and sandals. */
export const item: ItemModel = {
  id: 'umbrella-mat',
  name: 'ร่มชายหาดกับเสื่อ',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    // mat: strips across, in three colours
    const step = MAT.len / MAT.strips;
    const colours = ['sunYellow', 'orange', 'white'] as const;
    for (let i = 0; i < MAT.strips; i++) {
      parts.push(kit.box([MAT.w, MAT.t, step - 0.01], [0, MAT.t / 2, -MAT.len / 2 + step * (i + 0.5)], colours[i % 3]));
    }
    // pole stuck through the mat, with a base disc
    parts.push(kit.cylinder(POLE.r, POLE.r, POLE.h - MAT.t, [POLE.x, MAT.t + (POLE.h - MAT.t) / 2, POLE.z], 'white', { segments: 8 }));
    parts.push(kit.cylinder(0.09, 0.11, 0.04, [POLE.x, MAT.t + 0.02, POLE.z], 'stoneDark', { segments: 8 }));
    // canopy: two six-sided-style cones turned half a segment apart so the faces alternate red and white
    const half = Math.PI / CANOPY.segments;
    parts.push(kit.cone(CANOPY.r, CANOPY.h, [POLE.x, POLE.h + CANOPY.h / 2 - 0.02, POLE.z], 'red', { segments: CANOPY.segments, motion: SWAY }));
    parts.push(kit.cone(CANOPY.r * 1.005, CANOPY.h, [POLE.x, POLE.h + CANOPY.h / 2 - 0.02, POLE.z], 'white', { segments: CANOPY.segments, rotate: [0, half, 0], scale: [1, 1.001, 1], motion: SWAY }));
    parts.push(kit.sphere(0.04, [POLE.x, POLE.h + CANOPY.h + 0.0, POLE.z], 'sunYellow', { detail: 0, motion: SWAY }));
    // a bag on the mat: body, flap and a strap
    parts.push(kit.box([0.26, 0.2, 0.2], [-0.12, MAT.t + 0.1, 0.35], 'blue'));
    parts.push(kit.box([0.28, 0.05, 0.22], [-0.12, MAT.t + 0.215, 0.35], 'navy'));
    parts.push(kit.torus(0.09, 0.012, [-0.12, MAT.t + 0.27, 0.35], 'navy', { radialSegments: 4, tubularSegments: 8, arc: Math.PI, rotate: [0, Math.PI / 2, 0] }));
    // sandals: two soles with a strap each
    for (const dz of [-0.1, 0.1]) {
      parts.push(kit.box([0.2, 0.03, 0.08], [0.18, MAT.t + 0.015, 0.7 + dz], 'orange'));
      parts.push(kit.box([0.04, 0.045, 0.085], [0.2, MAT.t + 0.04, 0.7 + dz], 'pink'));
    }
    return kit.finish(parts);
  },
};
