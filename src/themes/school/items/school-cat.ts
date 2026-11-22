import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';

// A round orange cat sitting on a square cushion. The body faces +x (the front); the head turns a
// little towards +z, so the cat looks out at the player in the default 3/4 view.
const CUSHION = { s: 0.54, h: 0.06, puff: 0.055, tassel: 0.035 }; // a flat box, a squashed dome on top for the puffy middle, tassels on the corners
const SEAT = CUSHION.h + CUSHION.puff * 0.5; // where the cat sits
const HIPS: Vec3 = [-0.04, SEAT + 0.1, 0]; // wide bottom of the body
const HIPS_R: Vec3 = [0.18, 0.13, 0.18];
const CHEST: Vec3 = [0.0, SEAT + 0.23, 0]; // narrower upper body
const CHEST_R: Vec3 = [0.13, 0.15, 0.13];
const HEAD: Vec3 = [0.04, SEAT + 0.45, 0.01];
const HEAD_R = 0.175; // a big head: chunky and cute
const LOOK = 0.45; // head turn towards +z (radians)
const EAR = { r: 0.07, h: 0.12, side: 0.1, tilt: 0.3 };
const TAIL = { r: 0.2, tube: 0.042, start: 0.15 * Math.PI, arc: 0.95 * Math.PI }; // curls round the +z side, tip at the front

/** แมวโรงเรียน: the school cat, a chunky orange cat sitting on its cushion with its tail curled round. */
export const item: ItemModel = {
  id: 'school-cat',
  name: 'แมวโรงเรียน',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    /** A point on the head: `f` forward (where the face looks), `u` up, `s` to the cat's left (+z when facing +x). */
    const onHead = (f: number, u: number, s: number): Vec3 =>
      [HEAD[0] + f * Math.cos(LOOK) - s * Math.sin(LOOK), HEAD[1] + u, HEAD[2] + f * Math.sin(LOOK) + s * Math.cos(LOOK)];
    const face = HEAD_R * 0.86;
    const look: Vec3 = [0, -LOOK, 0];
    const half = CUSHION.s / 2 - 0.03;
    const parts: Part[] = [
      kit.box([CUSHION.s, CUSHION.h, CUSHION.s], [0, CUSHION.h / 2, 0], 'blue'),
      kit.dome(1, [0, CUSHION.h - 0.01, 0], 'blue', { segments: 8, scale: [CUSHION.s * 0.48, CUSHION.puff + 0.01, CUSHION.s * 0.48] }),
      kit.sphere(1, HIPS, 'orange', { scale: HIPS_R }),
      kit.sphere(1, CHEST, 'orange', { scale: CHEST_R }),
      kit.sphere(1, [CHEST[0] + 0.085, CHEST[1] - 0.02, 0], 'white', { detail: 0, scale: [0.07, 0.12, 0.09] }), // white chest
      kit.sphere(HEAD_R, HEAD, 'orange', { scale: [0.92, 0.88, 1.06], rotate: look }),
      // face: eyes, white muzzle, pink nose
      kit.sphere(1, onHead(face - 0.008, 0.028, -0.065), 'charcoal', { detail: 0, scale: [0.02, 0.036, 0.028], rotate: look }),
      kit.sphere(1, onHead(face - 0.008, 0.028, 0.065), 'charcoal', { detail: 0, scale: [0.02, 0.036, 0.028], rotate: look }),
      kit.sphere(0.052, onHead(face - 0.022, -0.055, -0.036), 'white', { detail: 0 }),
      kit.sphere(0.052, onHead(face - 0.022, -0.055, 0.036), 'white', { detail: 0 }),
      kit.sphere(0.024, onHead(face + 0.022, -0.024, 0), 'pink', { detail: 0 }),
      // front paws
      kit.sphere(1, [0.15, SEAT + 0.03, -0.06], 'white', { detail: 0, scale: [0.065, 0.04, 0.05] }),
      kit.sphere(1, [0.15, SEAT + 0.03, 0.06], 'white', { detail: 0, scale: [0.065, 0.04, 0.05] }),
    ];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) parts.push(kit.sphere(CUSHION.tassel, [sx * half, CUSHION.h, sz * half], 'sunYellow', { detail: 0 }));
    }
    // triangle ears: three-sided cones with a flat face to the front, leaning out; pink inside
    for (const s of [-1, 1]) {
      const at = onHead(-0.01, HEAD_R * 0.7 + EAR.h / 2 - 0.02, s * EAR.side);
      const inner = onHead(0.022, HEAD_R * 0.7 + EAR.h * 0.3 - 0.01, s * (EAR.side + 0.006));
      const rot: Vec3 = [s * EAR.tilt, -Math.PI / 2 - LOOK, 0];
      parts.push(
        kit.cone(EAR.r, EAR.h, at, 'orange', { segments: 3, rotate: rot }),
        kit.cone(EAR.r * 0.55, EAR.h * 0.6, inner, 'pink', { segments: 3, rotate: rot }),
      );
    }
    // tail: part of a flat ring round the hips, from the back over the +z side to the front, white tip
    const tailY = SEAT + TAIL.tube * 0.9;
    parts.push(
      kit.torus(TAIL.r, TAIL.tube, [HIPS[0], tailY, 0], 'orange', { arc: TAIL.arc, rotate: [Math.PI / 2, 0, TAIL.start] }),
      kit.sphere(TAIL.tube * 1.15, [HIPS[0] + TAIL.r * Math.cos(TAIL.start), tailY, TAIL.r * Math.sin(TAIL.start)], 'white', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
