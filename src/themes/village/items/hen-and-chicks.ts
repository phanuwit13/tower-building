import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

/** One farm bird: a hen, a rooster (an ordinary farm bird) or a chick. `k` scales it; local f forward (+x at yaw 0). */
export interface BirdSpec {
  x: number; z: number; yaw: number; k: number;
  kind: 'hen' | 'rooster' | 'chick';
  body: PaletteColor; wing: PaletteColor;
  tail?: PaletteColor[]; // hen: one feather colour, rooster: a fan of three
  peck?: boolean; // head down, pecking the ground
}

export function bird(kit: StyleKit, base: number, a: BirdSpec): Part[] {
  const c = Math.cos(a.yaw);
  const n = Math.sin(a.yaw);
  const k = a.k;
  const pt = (f: number, u: number, s: number): Vec3 => [a.x + (f * c + s * n) * k, base + u * k, a.z + (-f * n + s * c) * k];
  const rotate: Vec3 = [0, a.yaw, 0];
  const chick = a.kind === 'chick';
  const bu = chick ? 0.1 : 0.14; // body centre height
  const hf = a.peck ? 0.14 : chick ? 0.085 : 0.12; // head position
  const hu = a.peck ? bu - 0.02 : chick ? 0.17 : 0.235;
  const hr = chick ? 0.075 : 0.058;
  const eye = Math.max(0.011 * k, 0.012);
  const parts: Part[] = [
    kit.sphere(1, pt(0, bu, 0), a.body, { detail: chick ? 0 : 1, scale: [(chick ? 0.1 : 0.125) * k, (chick ? 0.095 : 0.1) * k, (chick ? 0.09 : 0.09) * k], rotate }),
    kit.sphere(hr * k, pt(hf, hu, 0), a.body, { detail: chick ? 0 : 1 }),
    kit.cone(0.022 * k + 0.004, 0.055 * k, pt(hf + hr + 0.01, hu - 0.005, 0), chick ? 'orange' : 'sunYellow', { segments: 5, rotate: [0, a.yaw, -Math.PI / 2] }),
    kit.sphere(eye, pt(hf + hr * 0.7, hu + hr * 0.3, hr * 0.8), 'charcoal', { detail: 0 }),
    kit.sphere(eye, pt(hf + hr * 0.7, hu + hr * 0.3, -hr * 0.8), 'charcoal', { detail: 0 }),
  ];
  if (!chick) {
    const big = a.kind === 'rooster' ? 1.3 : 1;
    parts.push(
      kit.cylinder(Math.max(0.014 * k, 0.013), Math.max(0.014 * k, 0.013), 0.07 * k, pt(0, 0.035, 0.04), 'orange', { segments: 4 }),
      kit.cylinder(Math.max(0.014 * k, 0.013), Math.max(0.014 * k, 0.013), 0.07 * k, pt(0, 0.035, -0.04), 'orange', { segments: 4 }),
      kit.sphere(1, pt(hf, hu + hr * 0.95, 0), 'red', { detail: 0, scale: [0.03 * big * k, 0.034 * big * k, 0.016 * k], rotate }),
      kit.sphere(1, pt(hf + hr * 0.7, hu - hr * 0.85, 0), 'red', { detail: 0, scale: [0.014 * k, 0.026 * big * k, 0.014 * k], rotate }),
    );
    for (const sg of [-1, 1]) parts.push(kit.sphere(1, pt(-0.01, bu + 0.005, sg * 0.082), a.wing, { detail: 0, scale: [0.085 * k, 0.06 * k, 0.03 * k], rotate }));
    // tail feathers: cones leaning back-up from the rump
    const feathers = a.tail ?? [a.wing];
    const tilts = feathers.length === 1 ? [0.8] : [0.5, 0.9, 1.3];
    const h = (a.kind === 'rooster' ? 0.2 : 0.12) * k;
    feathers.forEach((col, i) => {
      const t = tilts[i];
      const rear = pt(-0.1 - Math.sin(t) * (h / k) * 0.5, bu + 0.04 + Math.cos(t) * (h / k) * 0.5, 0);
      parts.push(kit.cone(0.05 * k, h, rear, col, { segments: 5, rotate: [0, a.yaw, t] }));
    });
  }
  return parts;
}

const FLOOR_H = 0.03;

/** แม่ไก่กับลูกเจี๊ยบ: a hen with four yellow chicks pecking grain. */
export const item: ItemModel = {
  id: 'hen-and-chicks',
  name: 'แม่ไก่กับลูกเจี๊ยบ',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.98, FLOOR_H, 0.98], [0, FLOOR_H / 2, 0], 'lime')];
    parts.push(...bird(kit, FLOOR_H, { x: -0.18, z: -0.05, yaw: -0.3, k: 0.7, kind: 'hen', body: 'white', wing: 'sand', tail: ['sand'] }));
    for (const [x, z, yaw] of [[0.25, -0.2, 0.4], [0.32, 0.12, -0.2], [0.05, 0.3, -1.1], [-0.2, 0.33, -0.7]] as const) {
      parts.push(...bird(kit, FLOOR_H, { x, z, yaw, k: 0.5, kind: 'chick', body: 'sunYellow', wing: 'orange', peck: true }));
    }
    // grains on the ground
    for (const [x, z] of [[0.38, -0.3], [0.42, 0.0], [0.2, 0.22], [0.12, -0.38], [-0.02, 0.38]] as const) {
      parts.push(kit.sphere(0.018, [x, FLOOR_H + 0.012, z], 'brass', { detail: 0 }));
    }
    return kit.finish(parts);
  },
};
