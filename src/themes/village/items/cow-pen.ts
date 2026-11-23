import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

/** A spot on a quadruped's coat: on the back (`s` across, no `u`) or on the flank (`u` up, `sgn` the side). */
export interface Spot { f: number; r: number; s?: number; u?: number; sgn?: 1 | -1 }

/** One four-legged farm animal (standing, or lying when `leg` is 0). Local axes: f forward (+x at yaw 0), u up, s sideways (+z). */
export interface QuadSpec {
  x: number; z: number; yaw: number;
  len: number; wid: number; hgt: number; leg: number; // body ellipsoid size and the length of the legs under it
  color: PaletteColor; legColor?: PaletteColor;
  head: number; muzzle: PaletteColor; snout?: number;
  ear: 'flop' | 'perk' | 'none'; earColor?: PaletteColor;
  horn?: 'out' | 'up'; hornColor?: PaletteColor;
  tail?: PaletteColor; beard?: PaletteColor; collar?: PaletteColor;
  spots?: Spot[]; spotColor?: PaletteColor;
}

/** A chunky cartoon quadruped (cow, buffalo, pig, goat, dog), built from ellipsoids, on the ground level `base`. */
export function quadruped(kit: StyleKit, base: number, a: QuadSpec): Part[] {
  const c = Math.cos(a.yaw);
  const n = Math.sin(a.yaw);
  const pt = (f: number, u: number, s: number): Vec3 => [a.x + f * c + s * n, base + u, a.z - f * n + s * c];
  const rotate: Vec3 = [0, a.yaw, 0];
  const lying = a.leg === 0;
  const L = a.len / 2;
  const W = a.wid / 2;
  const H = a.hgt / 2;
  const hr = a.head;
  const bodyY = lying ? a.hgt * 0.45 : a.leg + a.hgt * 0.45;
  const headF = L + hr * 0.45;
  const headU = bodyY + H * 0.5 + hr * 0.3;
  const sn = a.snout ?? 1;
  const parts: Part[] = [
    kit.sphere(1, pt(0, bodyY, 0), a.color, { scale: [L, H, W], rotate }),
    kit.sphere(hr * 0.85, pt(L * 0.8, (bodyY + headU) / 2, 0), a.color, { detail: 0, scale: [1, 1.1, 1], rotate }),
    kit.sphere(hr, pt(headF, headU, 0), a.color, { scale: [1.1, 0.95, 0.95], rotate }),
    kit.sphere(hr * 0.6 * sn, pt(headF + hr * 0.8, headU - hr * 0.3, 0), a.muzzle, { detail: 0, scale: [1.1, 0.8, 1.1], rotate }),
  ];
  for (const sg of [-1, 1]) {
    parts.push(kit.sphere(hr * 0.17, pt(headF + hr * 0.62, headU + hr * 0.25, sg * hr * 0.6), 'charcoal', { detail: 0 }));
    const ec = a.earColor ?? a.color;
    if (a.ear === 'flop') parts.push(kit.sphere(hr * 0.5, pt(headF - hr * 0.1, headU + hr * 0.3, sg * hr * 1.0), ec, { detail: 0, scale: [0.7, 0.35, 1], rotate }));
    if (a.ear === 'perk') parts.push(kit.cone(hr * 0.35, hr * 0.8, pt(headF - hr * 0.2, headU + hr * 1.0, sg * hr * 0.55), ec, { segments: 4 }));
    if (a.horn === 'out') parts.push(kit.sphere(hr * 0.28, pt(headF - hr * 0.2, headU + hr * 0.55, sg * hr * 1.15), a.hornColor ?? 'white', { detail: 0, scale: [0.9, 0.6, 2.2], rotate }));
    if (a.horn === 'up') parts.push(kit.cone(hr * 0.2, hr * 0.7, pt(headF - hr * 0.1, headU + hr * 1.0, sg * hr * 0.4), a.hornColor ?? 'white', { segments: 6 }));
  }
  if (a.collar) parts.push(kit.torus(hr * 0.8, 0.022, pt(L * 0.82, (bodyY + headU) / 2, 0), a.collar, { radialSegments: 4, tubularSegments: 8, rotate: [0, a.yaw + Math.PI / 2, 0] }));
  if (a.beard) parts.push(kit.sphere(hr * 0.18, pt(headF + hr * 0.55, headU - hr * 0.85, 0), a.beard, { detail: 0, scale: [0.8, 1.6, 0.8], rotate }));
  const lc = a.legColor ?? a.color;
  if (!lying) {
    const r = a.wid * 0.13;
    for (const f of [L * 0.55, -L * 0.55]) {
      for (const sg of [-1, 1]) parts.push(kit.cylinder(r * 0.8, r, a.leg + H * 0.5, pt(f, (a.leg + H * 0.5) / 2, sg * W * 0.6), lc, { segments: 6 }));
    }
    if (a.tail) {
      const tl = Math.min(a.hgt * 0.9, bodyY + H * 0.3 - 0.06); // hangs from the rump, tuft kept above the ground
      parts.push(
        kit.cylinder(0.02, 0.02, tl, pt(-L * 0.97, bodyY + H * 0.3 - tl / 2, 0), a.color, { segments: 4 }),
        kit.sphere(0.04, pt(-L * 0.97, bodyY + H * 0.3 - tl, 0), a.tail, { detail: 0 }),
      );
    }
  } else {
    const r = a.wid * 0.14;
    for (const sg of [-1, 1]) parts.push(kit.sphere(r, pt(L * 0.75, r * 0.85, sg * W * 0.55), lc, { detail: 0, scale: [2, 0.8, 0.8], rotate }));
    if (a.tail) parts.push(kit.torus(0.07, 0.03, pt(-L - 0.03, 0.1, 0), a.tail, { radialSegments: 4, tubularSegments: 12, arc: Math.PI * 1.5, rotate })); // a curled tail
  }
  for (const sp of a.spots ?? []) {
    const col = a.spotColor ?? 'charcoal';
    if (sp.u === undefined) {
      const s = sp.s ?? 0;
      const k = Math.max(1 - (sp.f / L) ** 2 - (s / W) ** 2, 0.05);
      parts.push(kit.sphere(sp.r, pt(sp.f, bodyY + H * Math.sqrt(k) - 0.004, s), col, { detail: 0, scale: [1, 0.3, 1] }));
    } else {
      const k = Math.max(1 - (sp.f / L) ** 2 - (sp.u / H) ** 2, 0.05);
      parts.push(kit.sphere(sp.r, pt(sp.f, bodyY + sp.u, (sp.sgn ?? 1) * W * Math.sqrt(k)), col, { detail: 0, scale: [1, 1, 0.3], rotate }));
    }
  }
  return parts;
}

const FLOOR_H = 0.03;
const POST = { w: 0.07, h: 0.42 };
const EDGE = 0.94; // fence line

/** คอกวัว: a wooden fenced pen with a white spotted cow, a brown cow, a hay trough and a water trough. */
export const item: ItemModel = {
  id: 'cow-pen',
  name: 'คอกวัว',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.98, FLOOR_H, 1.98], [0, FLOOR_H / 2, 0], 'sand')];
    // fence: posts every 0.63, two rails on each side
    for (const a of [-EDGE, -0.31, 0.31, EDGE]) {
      for (const b of [-EDGE, EDGE]) {
        parts.push(kit.box([POST.w, POST.h, POST.w], [a, FLOOR_H + POST.h / 2, b], 'woodDark'));
        if (Math.abs(a) < EDGE) parts.push(kit.box([POST.w, POST.h, POST.w], [b, FLOOR_H + POST.h / 2, a], 'woodDark'));
      }
    }
    for (const y of [0.2, 0.36]) {
      for (const b of [-EDGE, EDGE]) {
        parts.push(kit.box([2 * EDGE, 0.04, 0.04], [0, FLOOR_H + y, b], 'wood'), kit.box([0.04, 0.04, 2 * EDGE], [b, FLOOR_H + y, 0], 'wood'));
      }
    }
    // hay trough (back, along z=-0.75) with a pile of hay, water trough (left side along x=-0.75)
    parts.push(
      kit.box([0.8, 0.14, 0.26], [-0.2, FLOOR_H + 0.07, -0.72], 'wood'),
      kit.box([0.7, 0.06, 0.2], [-0.2, FLOOR_H + 0.15, -0.72], 'sunYellow'),
      kit.sphere(0.16, [-0.35, FLOOR_H + 0.2, -0.72], 'sunYellow', { detail: 0, scale: [1.3, 0.7, 1] }),
      kit.box([0.28, 0.14, 0.7], [-0.74, FLOOR_H + 0.07, 0.4], 'stone'),
      kit.box([0.2, 0.03, 0.62], [-0.74, FLOOR_H + 0.14, 0.4], 'navy'),
      kit.sphere(0.12, [0.7, FLOOR_H + 0.05, -0.75], 'sunYellow', { detail: 0, scale: [1.3, 0.55, 1] }),
    );
    parts.push(
      ...quadruped(kit, FLOOR_H, {
        x: 0.2, z: 0.4, yaw: -0.4, len: 0.7, wid: 0.36, hgt: 0.3, leg: 0.17, color: 'white', legColor: 'white', head: 0.13, muzzle: 'pink',
        ear: 'flop', earColor: 'charcoal', tail: 'charcoal', spotColor: 'charcoal',
        spots: [{ f: 0.05, s: 0.07, r: 0.09 }, { f: -0.18, s: -0.06, r: 0.08 }, { f: 0.12, u: 0.02, sgn: 1, r: 0.07 }],
      }),
      ...quadruped(kit, FLOOR_H, {
        x: 0.25, z: -0.3, yaw: 0.3, len: 0.7, wid: 0.36, hgt: 0.3, leg: 0.17, color: 'wood', legColor: 'woodDark', head: 0.13, muzzle: 'cream',
        ear: 'flop', earColor: 'woodDark', tail: 'woodDark', spotColor: 'cream',
        spots: [{ f: -0.05, s: 0.05, r: 0.07 }],
      }),
    );
    return kit.finish(parts);
  },
};
