import * as THREE from 'three';
import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A bamboo pole on a stone footing carrying a big six-bladed wheel. The hub axis is tilted up towards the default
// camera (from +x+z, about 57 degrees up) so the wheel's face is what kids see. It spins about that hub axis
// (one pivot, one axis, one phase for every blade) and a tail vane sits behind the pole.
const POLE_H = 1.7;
const AXIS = new THREE.Vector3(0.62, 0.48, 0.62).normalize(); // the way the wheel faces
const HUB = new THREE.Vector3(0, POLE_H, 0).addScaledVector(AXIS, 0.16); // hub centre, clear of the pole top
const BLADE = { len: 0.31, wide: 0.2, gap: 0.06, thick: 0.03, twist: 0.35 };
const SPIN: MotionOpts = { kind: 'spin', pivot: [HUB.x, HUB.y, HUB.z], axis: [AXIS.x, AXIS.y, AXIS.z], speed: 0.4 };
const BLADE_COLOURS: PaletteColor[] = ['red', 'sunYellow', 'blue', 'orange', 'pink', 'lime'];

// Wheel frame: local x = hub axis, local y = most upright direction in the wheel plane, local z completes the set.
const UP_IN_PLANE = new THREE.Vector3(0, 1, 0).addScaledVector(AXIS, -AXIS.y).normalize();
const FRAME = new THREE.Matrix4().makeBasis(AXIS, UP_IN_PLANE, new THREE.Vector3().crossVectors(AXIS, UP_IN_PLANE));

/** กังหันลมไม้ไผ่: a bamboo pinwheel on a tall pole. */
export const item: ItemModel = {
  id: 'pinwheel',
  name: 'กังหันลมไม้ไผ่',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.24, 0.28, 0.08, [0, 0.04, 0], 'stoneDark', { segments: 10 }), // stone footing
      kit.cylinder(0.055, 0.065, POLE_H, [0, POLE_H / 2, 0], 'lime', { segments: 8 }),
      kit.sphere(0.07, [0, POLE_H + 0.02, 0], 'leafDark', { detail: 0 }), // pole cap
      rod(kit, [0, POLE_H + 0.02, 0], [HUB.x, HUB.y, HUB.z], 0.025, 'woodDark'), // axle
      // tail vane behind the pole (-x, -z), a flat red fin on a short arm
      rod(kit, [0, POLE_H, 0], [-0.2, POLE_H, -0.2], 0.02, 'woodDark', { segments: 4 }),
      kit.box([0.03, 0.18, 0.26], [-0.3, POLE_H + 0.02, -0.3], 'red', { rotate: [0, Math.PI / 4, 0] }),
    ];
    for (const y of [0.3, 0.7, 1.1, 1.5]) parts.push(kit.cylinder(0.078, 0.078, 0.035, [0, y, 0], 'leafDark', { segments: 8 })); // bamboo nodes
    parts.push(kit.sphere(0.08, [HUB.x, HUB.y, HUB.z], 'sunYellow', { detail: 1, motion: SPIN }));
    BLADE_COLOURS.forEach((c, i) => {
      const a = (i / BLADE_COLOURS.length) * Math.PI * 2;
      const mid = BLADE.gap + BLADE.len / 2;
      const local = new THREE.Vector3(0.03, mid * Math.cos(a), mid * Math.sin(a)).applyMatrix4(FRAME);
      const m = FRAME.clone().multiply(new THREE.Matrix4().makeRotationX(a)).multiply(new THREE.Matrix4().makeRotationY(BLADE.twist));
      const e = new THREE.Euler().setFromRotationMatrix(m, 'XYZ');
      parts.push(kit.box([BLADE.thick, BLADE.len, BLADE.wide], [HUB.x + local.x, HUB.y + local.y, HUB.z + local.z], c, { rotate: [e.x, e.y, e.z], motion: SPIN }));
    });
    return kit.finish(parts);
  },
};
