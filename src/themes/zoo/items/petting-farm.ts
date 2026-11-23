import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, gableRoof } from '../../../models/parts';

// 2x2. The red barn fills the back-left corner (-x, -z) and its double door faces the sandy yard (+x).
// A low wooden fence runs along the +x and +z edges. Two goats, a sheep and a hay bale in the yard.
const GRASS_H = 0.02;
const SAND_H = 0.03;
const BARN = { x: -0.54, z: -0.45, w: 0.8, d: 0.88, wallH: 0.46, rise: 0.28 };
const BARN_FRONT_X = BARN.x + BARN.w / 2;
const FENCE = { edge: 0.93, post: 0.05, postH: 0.26, railH: 0.035, y1: 0.12, y2: 0.22 };
const LEG = 0.12;

/** A friendly goat at `at`, facing `yaw` (radians about y, 0 = +x, + turns towards -z). */
function goat(kit: StyleKit, at: Vec3, yaw: number, coat: PaletteColor, patch: PaletteColor): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const p = (f: number, u: number, sd: number): Vec3 => [at[0] + f * c + sd * s, at[1] + u, at[2] - f * s + sd * c];
  const parts: Part[] = [
    kit.sphere(1, p(0, LEG + 0.09, 0), coat, { scale: [0.15, 0.095, 0.085], rotate: [0, yaw, 0] }),
    kit.sphere(1, p(-0.02, LEG + 0.12, 0), patch, { detail: 0, scale: [0.07, 0.06, 0.09], rotate: [0, yaw, 0] }), // patch on the back
    kit.sphere(0.062, p(0.16, LEG + 0.2, 0), coat),
    kit.cone(0.02, 0.06, p(0.15, LEG + 0.075, 0), coat, { segments: 4, rotate: [0, yaw, Math.PI] }), // beard, hangs from the chin
    kit.cone(0.025, 0.07, p(-0.16, LEG + 0.15, 0), coat, { segments: 4, rotate: [0, yaw, 1.9] }), // tail
  ];
  for (const sd of [-1, 1]) {
    parts.push(
      kit.box([0.035, LEG, 0.035], p(0.09, LEG / 2, sd * 0.045), coat, { rotate: [0, yaw, 0] }),
      kit.box([0.035, LEG, 0.035], p(-0.09, LEG / 2, sd * 0.045), coat, { rotate: [0, yaw, 0] }),
      kit.cone(0.018, 0.07, p(0.14, LEG + 0.28, sd * 0.03), 'sand', { segments: 4, rotate: [0, yaw, 0.5] }), // horn
      kit.sphere(1, p(0.15, LEG + 0.2, sd * 0.07), patch, { detail: 0, scale: [0.03, 0.018, 0.05], rotate: [0, yaw, 0] }), // ear
      kit.box([0.022, 0.03, 0.022], p(0.21, LEG + 0.225, sd * 0.038), 'charcoal', { rotate: [0, yaw, 0] }), // big eye
    );
  }
  parts.push(kit.box([0.03, 0.025, 0.04], p(0.22, LEG + 0.18, 0), 'charcoal', { rotate: [0, yaw, 0] })); // nose
  return parts;
}

/** A fluffy sheep: cloud body, dark face and legs. */
function sheep(kit: StyleKit, at: Vec3, yaw: number): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const p = (f: number, u: number, sd: number): Vec3 => [at[0] + f * c + sd * s, at[1] + u, at[2] - f * s + sd * c];
  const parts: Part[] = [
    kit.sphere(1, p(0, LEG + 0.1, 0), 'white', { scale: [0.15, 0.115, 0.12], rotate: [0, yaw, 0] }),
    kit.sphere(0.075, p(0.05, LEG + 0.19, 0.05), 'white', { detail: 0 }),
    kit.sphere(0.075, p(-0.06, LEG + 0.18, -0.05), 'white', { detail: 0 }),
    kit.sphere(0.055, p(0.16, LEG + 0.15, 0), 'charcoal', { detail: 0 }),
    kit.sphere(0.045, p(0.14, LEG + 0.22, 0), 'white', { detail: 0 }), // woolly fringe
  ];
  for (const sd of [-1, 1]) {
    parts.push(
      kit.box([0.03, LEG, 0.03], p(0.08, LEG / 2, sd * 0.05), 'charcoal', { rotate: [0, yaw, 0] }),
      kit.box([0.03, LEG, 0.03], p(-0.08, LEG / 2, sd * 0.05), 'charcoal', { rotate: [0, yaw, 0] }),
      kit.sphere(1, p(0.15, LEG + 0.17, sd * 0.06), 'charcoal', { detail: 0, scale: [0.025, 0.015, 0.045], rotate: [0, yaw, 0] }), // ear
      kit.box([0.02, 0.026, 0.02], p(0.205, LEG + 0.17, sd * 0.03), 'white', { rotate: [0, yaw, 0] }), // eye
    );
  }
  return parts;
}

/** ฟาร์มแพะลูบได้: red barn corner, fenced yard, two goats, a sheep and a hay bale. */
export const item: ItemModel = {
  id: 'petting-farm',
  name: 'ฟาร์มแพะลูบได้',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const wallTop = GRASS_H + BARN.wallH;
    const parts: Part[] = [
      kit.box([1.9, GRASS_H, 1.9], [0, GRASS_H / 2, 0], 'lime'),
      kit.box([1.0, SAND_H, 1.8], [0.4, SAND_H / 2, 0], 'sand'), // yard x -0.1..0.9
      kit.box([0.8, SAND_H, 0.9], [-0.5, SAND_H / 2, 0.45], 'sand'), // yard in front of the barn's +z side
      kit.box([BARN.w, BARN.wallH, BARN.d], [BARN.x, GRASS_H + BARN.wallH / 2, BARN.z], 'red'),
      kit.wedge([BARN.d, BARN.rise, BARN.w], [BARN.x, wallTop + BARN.rise / 2, BARN.z], 'red', { rotate: [0, Math.PI / 2, 0] }),
      ...gableRoof(kit, { at: [BARN.x, wallTop, BARN.z], length: BARN.w + 0.04, width: BARN.d, rise: BARN.rise, eave: 0.04, color: 'woodDark', ridge: 'wood', along: 'x' }),
      ...door(kit, { at: [BARN_FRONT_X, GRASS_H + 0.2, BARN.z], facing: 'x+', w: 0.36, h: 0.4, color: 'white' }),
      // red doors on the white frame, with a cross brace on each leaf
      kit.box([0.02, 0.34, 0.15], [BARN_FRONT_X + 0.025, GRASS_H + 0.19, BARN.z - 0.085], 'red'),
      kit.box([0.02, 0.34, 0.15], [BARN_FRONT_X + 0.025, GRASS_H + 0.19, BARN.z + 0.085], 'red'),
      kit.box([0.02, 0.36, 0.025], [BARN_FRONT_X + 0.04, GRASS_H + 0.19, BARN.z - 0.085], 'white', { rotate: [0.7, 0, 0] }),
      kit.box([0.02, 0.36, 0.025], [BARN_FRONT_X + 0.04, GRASS_H + 0.19, BARN.z + 0.085], 'white', { rotate: [-0.7, 0, 0] }),
      kit.cylinder(0.06, 0.06, 0.02, [BARN_FRONT_X + 0.005, wallTop + 0.1, BARN.z], 'white', { segments: 8, rotate: [0, 0, Math.PI / 2] }), // loft round window
    ];
    // fence: along +x edge (z from -0.93 to 0.93) and +z edge (x from -0.93 to 0.93)
    const E = FENCE.edge;
    const postsAt: Array<[number, number]> = [];
    for (let i = 0; i <= 6; i++) postsAt.push([E, -E + (i * 2 * E) / 6]);
    for (let i = 0; i < 6; i++) postsAt.push([-E + (i * 2 * E) / 6, E]);
    for (const [x, z] of postsAt) parts.push(kit.box([FENCE.post, FENCE.postH, FENCE.post], [x, SAND_H + FENCE.postH / 2 - 0.01, z], 'woodDark'));
    for (const y of [FENCE.y1, FENCE.y2]) {
      parts.push(
        kit.box([0.03, FENCE.railH, 2 * E], [E, SAND_H + y, 0], 'wood'),
        kit.box([2 * E, FENCE.railH, 0.03], [0, SAND_H + y + 0.0, E - 0.0], 'wood'),
      );
    }
    // hay bale by the barn door, with two darker straw bands
    const HAY: Vec3 = [-0.02, SAND_H + 0.09, -0.78];
    parts.push(
      kit.box([0.3, 0.18, 0.2], HAY, 'sunYellow'),
      kit.box([0.03, 0.185, 0.205], [HAY[0] - 0.07, HAY[1], HAY[2]], 'brass'),
      kit.box([0.03, 0.185, 0.205], [HAY[0] + 0.07, HAY[1], HAY[2]], 'brass'),
    );
    parts.push(
      ...goat(kit, [0.4, SAND_H, 0.35], 0.5, 'white', 'woodDark'),
      ...goat(kit, [0.5, SAND_H, -0.4], -0.9, 'cream', 'wood'),
      ...sheep(kit, [-0.45, SAND_H, 0.5], 0.4),
    );
    return kit.finish(parts);
  },
};
