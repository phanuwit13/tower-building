import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A lawn with a peacock showing its fanned tail and a peahen beside it.
const LAWN = { w: 0.96, d: 1.96, h: 0.03 };
const G = LAWN.h;

function bird(kit: StyleKit, x: number, z: number, yaw: number, o: { body: PaletteColor; neck: PaletteColor; belly: PaletteColor; s: number }): Part[] {
  const c = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const at = (lx: number, ly: number, lz = 0): Vec3 => [x + (lx * c + lz * sn) * o.s, G + ly * o.s, z + (-lx * sn + lz * c) * o.s];
  const turn: Vec3 = [0, yaw, 0];
  const s = o.s;
  const parts: Part[] = [
    kit.sphere(0.13 * s, at(0, 0.24), o.body, { scale: [1.35, 0.95, 0.9], rotate: turn }),
    kit.sphere(0.08 * s, at(0.04, 0.22), o.belly, { detail: 0, scale: [1.3, 0.8, 1.1], rotate: turn }),
    kit.cylinder(0.05 * s, 0.07 * s, 0.22 * s, at(0.15, 0.36), o.neck, { segments: 8, rotate: [0, yaw, -0.35] }),
    kit.sphere(0.065 * s, at(0.21, 0.5), o.neck, { scale: [1, 1, 0.95], rotate: turn }),
    kit.cone(0.025 * s, 0.07 * s, at(0.29, 0.49), 'orange', { segments: 4, rotate: [0, yaw, -Math.PI / 2] }),
  ];
  for (const z of [-1, 1]) {
    parts.push(
      kit.sphere(0.024 * s, at(0.25, 0.53, z * 0.045), 'white', { detail: 0 }),
      kit.sphere(0.013 * s, at(0.275, 0.53, z * 0.05), 'charcoal', { detail: 0 }),
      kit.cylinder(0.014 * s, 0.014 * s, 0.14 * s, at(0.0, 0.07, z * 0.05), 'stoneDark', { segments: 4 }),
      kit.box([0.08 * s, 0.015 * s, 0.03 * s], at(0.03, 0.007, z * 0.05), 'stoneDark', { rotate: turn }),
    );
  }
  return parts;
}

/** สนามนกยูง: a peacock with its tail fanned out and a peahen on the lawn. */
export const item: ItemModel = {
  id: 'peacock-lawn',
  name: 'สนามนกยูง',
  category: 'animal',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const px = 0.0;
    const pz = -0.3;
    const yaw = 0; // faces +x; the fan is built in the y-z plane so its tilt stays simple
    const parts: Part[] = [
      kit.box([LAWN.w, LAWN.h, LAWN.d], [0, LAWN.h / 2, 0], 'lime'),
      ...bird(kit, px, pz, yaw, { body: 'blue', neck: 'teal', belly: 'teal', s: 1 }),
      ...bird(kit, 0.12, 0.5, 2.6, { body: 'sand', neck: 'wood', belly: 'cream', s: 1.05 }),
    ];
    // crest of the peacock
    const c = Math.cos(yaw);
    const sn = Math.sin(yaw);
    const head = (lx: number, ly: number, lz = 0): Vec3 => [px + lx * c + lz * sn, G + ly, pz - lx * sn + lz * c];
    for (const lz of [-0.02, 0, 0.02]) {
      parts.push(kit.cylinder(0.006, 0.006, 0.08, head(0.2, 0.6, lz), 'stoneDark', { segments: 4 }), kit.sphere(0.014, head(0.2, 0.65, lz), 'sunYellow', { detail: 0 }));
    }
    // the fan: flat feathers radiating from the tail base, in the plane across the peacock's back
    const BASE: [number, number] = [-0.15, 0.24]; // local x, y
    const N = 9;
    for (let i = 0; i < N; i++) {
      const ang = ((i - (N - 1) / 2) / ((N - 1) / 2)) * 1.3; // angle from vertical, along the bird's local z
      const len = 0.52;
      const dz = Math.sin(ang);
      const dy = Math.cos(ang);
      const lx = BASE[0] - 0.02 - (i % 2) * 0.015;
      const mid = head(lx, BASE[1] + (dy * len) / 2, (dz * len) / 2);
      const tip = head(lx - 0.012, BASE[1] + dy * (len - 0.03), dz * (len - 0.03));
      const rot: Vec3 = [ang, 0, 0];
      parts.push(kit.box([0.02, len, 0.14], mid, i % 2 ? 'leafDark' : 'leaf', { rotate: rot }));
      parts.push(
        kit.sphere(0.06, tip, 'teal', { detail: 0, scale: [0.3, 1, 0.8], rotate: rot }),
        kit.sphere(0.028, head(lx - 0.024, BASE[1] + dy * (len - 0.03), dz * (len - 0.03)), 'sunYellow', { detail: 0, scale: [0.4, 1, 0.9], rotate: rot }),
      );
    }
    // a few flowers and a bush
    parts.push(
      kit.sphere(0.14, [0.3, 0.13, -0.78], 'leaf', { scale: [1.2, 0.9, 1.2] }),
      kit.sphere(0.04, [0.38, 0.24, -0.74], 'pink', { detail: 0 }),
      kit.sphere(0.04, [-0.3, 0.07, 0.8], 'sunYellow', { detail: 0 }),
      kit.sphere(0.04, [-0.36, 0.07, 0.7], 'pink', { detail: 0 }),
      kit.sphere(0.04, [0.33, 0.07, 0.1], 'purple', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
