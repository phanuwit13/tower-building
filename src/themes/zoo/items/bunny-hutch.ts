import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import { door, gableRoof } from '../../../models/parts';

// A small wooden hutch with a pitched roof (1×1) at the back (-x); two rabbits and a carrot on the lawn in front (+x).
const GRASS_H = 0.03;
const HUTCH = { x: -0.15, w: 0.5, d: 0.64, h: 0.34 }; // x is the centre, w along x
const LEG = 0.1;
const WALL_TOP = GRASS_H + LEG + HUTCH.h;
const RISE = 0.14;

/** A rabbit facing +x at `at`, turned by `yaw`. */
function rabbit(kit: StyleKit, at: Vec3, yaw: number, fur: 'white' | 'sand', ear: 'pink' | 'cream'): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const pt = (lx: number, ly: number, lz: number): Vec3 => [at[0] + lx * c + lz * s, at[1] + ly, at[2] - lx * s + lz * c];
  const rotate: Vec3 = [0, yaw, 0];
  return [
    kit.sphere(0.095, pt(0, 0.09, 0), fur, { detail: 0, scale: [1.2, 0.95, 0.95], rotate }),
    kit.sphere(0.08, pt(0.1, 0.19, 0), fur, { rotate }),
    // long ears with pink insides
    kit.sphere(0.04, pt(0.07, 0.34, 0.035), fur, { detail: 0, scale: [0.45, 2.1, 0.7], rotate }),
    kit.sphere(0.04, pt(0.07, 0.34, -0.035), fur, { detail: 0, scale: [0.45, 2.1, 0.7], rotate }),
    kit.sphere(0.025, pt(0.08, 0.34, 0.035), ear, { detail: 0, scale: [0.4, 2.2, 0.6], rotate }),
    kit.sphere(0.025, pt(0.08, 0.34, -0.035), ear, { detail: 0, scale: [0.4, 2.2, 0.6], rotate }),
    // big eyes, nose, tail
    kit.sphere(0.024, pt(0.165, 0.215, 0.04), 'charcoal', { detail: 0 }),
    kit.sphere(0.024, pt(0.165, 0.215, -0.04), 'charcoal', { detail: 0 }),
    kit.sphere(0.008, pt(0.178, 0.222, 0.047), 'white', { detail: 0 }),
    kit.sphere(0.008, pt(0.178, 0.222, -0.033), 'white', { detail: 0 }),
    kit.sphere(0.017, pt(0.18, 0.18, 0), 'pink', { detail: 0 }),
    kit.sphere(0.04, pt(-0.12, 0.1, 0), 'white', { detail: 0 }),
    kit.sphere(0.04, pt(0.08, 0.025, 0.065), fur, { detail: 0, scale: [1.5, 0.7, 0.9], rotate }),
    kit.sphere(0.04, pt(0.08, 0.025, -0.065), fur, { detail: 0, scale: [1.5, 0.7, 0.9], rotate }),
  ];
}

/** บ้านกระต่าย: a small hutch with a pitched roof and two rabbits in front. */
export const item: ItemModel = {
  id: 'bunny-hutch',
  name: 'บ้านกระต่าย',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const frontX = HUTCH.x + HUTCH.w / 2;
    const parts: Part[] = [
      kit.box([0.96, GRASS_H, 0.96], [0, GRASS_H / 2, 0], 'lime'),
      // hutch on four short legs, with a plank body
      ...([[1, 1], [1, -1], [-1, 1], [-1, -1]] as Array<[number, number]>).map(([sx, sz]) =>
        kit.box([0.06, LEG, 0.06], [HUTCH.x + sx * (HUTCH.w / 2 - 0.04), GRASS_H + LEG / 2, sz * (HUTCH.d / 2 - 0.04)], 'woodDark')),
      kit.box([HUTCH.w, HUTCH.h, HUTCH.d], [HUTCH.x, GRASS_H + LEG + HUTCH.h / 2, 0], 'wood'),
      kit.box([HUTCH.w + 0.02, 0.025, HUTCH.d + 0.02], [HUTCH.x, GRASS_H + LEG + 0.15, 0], 'woodDark'),
      ...gableRoof(kit, { at: [HUTCH.x, WALL_TOP, 0], length: HUTCH.w + 0.12, width: HUTCH.d, rise: RISE, eave: 0.05, color: 'red', ridge: 'redDark', along: 'x' }),
      // open arched doorway on the front with a little ramp
      ...door(kit, { at: [frontX, GRASS_H + LEG + 0.14, 0], facing: 'x+', w: 0.24, h: 0.24, color: 'bark' }),
      kit.box([0.01, 0.04, 0.3], [frontX + 0.005, GRASS_H + LEG + 0.28, 0], 'woodDark'),
      kit.box([0.16, 0.02, 0.2], [frontX + 0.08, GRASS_H + 0.07, 0], 'woodDark', { rotate: [0, 0, -0.5] }),
      // carrot lying on the lawn
      kit.cone(0.035, 0.14, [0.35, GRASS_H + 0.035, -0.36], 'orange', { segments: 6, rotate: [0, 0.4, -Math.PI / 2] }),
      kit.cone(0.03, 0.06, [0.25, GRASS_H + 0.035, -0.38], 'leaf', { segments: 5, rotate: [0, 0.4, Math.PI / 2] }),
      // tuft and flower
      kit.cone(0.04, 0.1, [0.4, GRASS_H + 0.05, 0.4], 'leaf', { segments: 5 }),
      kit.sphere(0.025, [0.1, GRASS_H + 0.07, -0.42], 'sunYellow', { detail: 0 }),
    ];
    parts.push(...rabbit(kit, [0.27, GRASS_H, 0.26], 0.5, 'white', 'pink'));
    parts.push(...rabbit(kit, [0.25, GRASS_H, -0.15], -0.5, 'sand', 'cream'));
    return kit.finish(parts);
  },
};
