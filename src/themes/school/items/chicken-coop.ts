import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import { gableRoof, wallPanel } from '../../../models/parts';

// Long side along z: the coop on short legs at the back end (-z), its pop-hole and ramp facing the
// yard (+z), where two hens walk about by a feeder. The nest box sticks out of the front (+x) wall.
const YARD = { w: 0.9, d: 1.9, h: 0.02 }; // sandy floor under everything
const COOP = { w: 0.56, d: 0.74, z: -0.52, legH: 0.2, wallH: 0.4 };
const COOP_FRONT_Z = COOP.z + COOP.d / 2; // its +z end wall
const WALL_TOP = COOP.legH + COOP.wallH;
const RISE = 0.24;
const EAVE = 0.08;
const ROOF_LEN = COOP.d + 0.1;
const HOLE = { w: 0.18, h: 0.22, x: 0.06 }; // dark pop-hole in the +z end, at floor level
const RAMP = { w: 0.17, t: 0.03, run: 0.36 }; // board from the pop-hole sill down to the yard
const NEST = { d: 0.3, out: 0.13, h: 0.18, y: COOP.legH + 0.15 }; // nest box on the +x wall
const FEEDER = { x: 0.18, z: 0.78, w: 0.36, d: 0.12, h: 0.08 }; // a wooden trough full of yellow grain, along x
/** Hens: [x, z, facing (radians about y, 0 = +x, + turns towards -z), pecking]. */
const HENS: Array<[number, number, number, boolean]> = [[-0.16, 0.4, -0.55, false], [0.2, 0.5, -Math.PI / 2, true]];
const LEG = 0.07;

/** One chunky white hen with cream wings standing at `at`, facing `yaw`; `peck` tips her head down. */
function hen(kit: StyleKit, at: Vec3, yaw: number, peck: boolean): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  // local (forward, up, side) -> world; +side is to her left when she faces +x
  const p = (f: number, u: number, sd: number): Vec3 => [at[0] + f * c + sd * s, at[1] + u, at[2] - f * s + sd * c];
  const head: Vec3 = peck ? [0.13, LEG + 0.1, 0] : [0.09, LEG + 0.21, 0];
  const beakTip = peck ? -Math.PI / 2 - 0.6 : -Math.PI / 2;
  const parts: Part[] = [
    kit.sphere(1, p(0, LEG + 0.1, 0), 'white', { scale: [0.135, 0.11, 0.1], rotate: [0, yaw, peck ? -0.2 : 0.12] }),
    kit.sphere(1, p(-0.12, LEG + 0.17, 0), 'white', { detail: 0, scale: [0.05, 0.085, 0.065], rotate: [0, yaw, 0.55] }), // tail tuft, up and back
    kit.sphere(0.07, p(...head), 'white'),
    kit.cone(0.026, 0.065, p(head[0] + 0.08, head[1] - 0.01, 0), 'orange', { segments: 4, rotate: [0, yaw, beakTip] }),
  ];
  for (const sd of [-1, 1]) {
    parts.push(
      kit.box([0.03, LEG + 0.04, 0.03], p(0, (LEG + 0.04) / 2, sd * 0.04), 'orange', { rotate: [0, yaw, 0] }),
      kit.sphere(1, p(-0.015, LEG + 0.11, sd * 0.088), 'cream', { detail: 0, scale: [0.09, 0.06, 0.03], rotate: [0, yaw, 0.2] }), // wing
      kit.box([0.024, 0.028, 0.02], p(head[0] + 0.035, head[1] + 0.018, sd * 0.058), 'charcoal', { rotate: [0, yaw, 0] }), // eye
    );
  }
  parts.push(kit.sphere(1, p(head[0] - 0.005, head[1] + 0.068, 0), 'red', { detail: 0, scale: [0.045, 0.03, 0.02], rotate: [0, yaw, 0] })); // comb
  return parts;
}

/** เล้าไก่: the school farm's little wooden hen house with a red roof and a ramp, two hens and a feeder. */
export const item: ItemModel = {
  id: 'chicken-coop',
  name: 'เล้าไก่',
  category: 'animal',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const hw = COOP.w / 2;
    const parts: Part[] = [
      kit.box([YARD.w, YARD.h, YARD.d], [0, YARD.h / 2, 0], 'sand'),
      kit.box([COOP.w, COOP.wallH, COOP.d], [0, COOP.legH + COOP.wallH / 2, COOP.z], 'wood'),
      kit.box([COOP.w + 0.04, 0.04, COOP.d + 0.04], [0, COOP.legH + 0.02, COOP.z], 'woodDark'), // floor edge
      kit.wedge([COOP.w, RISE, COOP.d], [0, WALL_TOP + RISE / 2, COOP.z], 'wood'), // gable ends
      ...gableRoof(kit, { at: [0, WALL_TOP, COOP.z], length: ROOF_LEN, width: COOP.w, rise: RISE, eave: EAVE, color: 'red', ridge: 'redDark' }),
      // pop-hole and a little white trim round it
      ...wallPanel(kit, { at: [HOLE.x, COOP.legH + 0.04 + HOLE.h / 2, COOP_FRONT_Z], facing: 'z+', w: HOLE.w + 0.06, h: HOLE.h + 0.04, depth: 0.02, color: 'white' }),
      ...wallPanel(kit, { at: [HOLE.x, COOP.legH + 0.04 + HOLE.h / 2, COOP_FRONT_Z], facing: 'z+', w: HOLE.w, h: HOLE.h, depth: 0.03, color: 'charcoal' }),
      // a round vent high in the back (-z) gable
      kit.cylinder(0.05, 0.05, 0.02, [0, WALL_TOP + 0.07, COOP.z - COOP.d / 2 - 0.005], 'charcoal', { segments: 6, rotate: [Math.PI / 2, 0, 0] }),
      // nest box with a sloping red lid
      kit.box([NEST.out, NEST.h, NEST.d], [hw + NEST.out / 2, NEST.y, COOP.z], 'wood'),
      kit.wedge([NEST.out + 0.03, 0.07, NEST.d + 0.04], [hw + (NEST.out + 0.03) / 2, NEST.y + NEST.h / 2 + 0.035, COOP.z], 'red', { apex: -0.5 }),
      ...wallPanel(kit, { at: [hw + NEST.out, NEST.y - 0.02, COOP.z], facing: 'x+', w: NEST.d - 0.08, h: 0.03, depth: 0.02, color: 'woodDark' }), // lid handle
    ];
    // legs
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) parts.push(kit.box([0.06, COOP.legH, 0.06], [sx * (hw - 0.05), COOP.legH / 2, COOP.z + sz * (COOP.d / 2 - 0.05)], 'woodDark'));
    }
    // ramp: from the sill down to the yard, with cleats so the hens don't slip
    const rise = COOP.legH + 0.04;
    const slope = Math.atan2(rise, RAMP.run);
    const len = Math.hypot(rise, RAMP.run);
    const rampMid: Vec3 = [HOLE.x, rise / 2 + (RAMP.t / 2) * Math.cos(slope), COOP_FRONT_Z + RAMP.run / 2];
    parts.push(kit.box([RAMP.w, RAMP.t, len], rampMid, 'wood', { rotate: [slope, 0, 0] }));
    for (const t of [-0.2, 0.2]) {
      parts.push(kit.box([RAMP.w, 0.02, 0.025], [HOLE.x, rampMid[1] - t * len * Math.sin(slope) + RAMP.t * 0.7, rampMid[2] + t * len * Math.cos(slope)], 'woodDark', { rotate: [slope, 0, 0] }));
    }
    // feeder: a trough on two little feet, full of grain
    parts.push(
      kit.box([FEEDER.w, FEEDER.h, FEEDER.d], [FEEDER.x, YARD.h + 0.03 + FEEDER.h / 2, FEEDER.z], 'woodDark'),
      kit.box([FEEDER.w - 0.04, 0.02, FEEDER.d - 0.04], [FEEDER.x, YARD.h + 0.03 + FEEDER.h, FEEDER.z], 'sunYellow'),
      kit.box([0.04, 0.03, FEEDER.d + 0.04], [FEEDER.x - FEEDER.w / 2 + 0.04, YARD.h + 0.015, FEEDER.z], 'woodDark'),
      kit.box([0.04, 0.03, FEEDER.d + 0.04], [FEEDER.x + FEEDER.w / 2 - 0.04, YARD.h + 0.015, FEEDER.z], 'woodDark'),
    );
    for (const [x, z, yaw, peck] of HENS) parts.push(...hen(kit, [x, YARD.h, z], yaw, peck));
    return kit.finish(parts);
  },
};
