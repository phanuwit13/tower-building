import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A carpeted cat tree: a tall post with a top perch, a middle perch, a house with a doorway and a
// scratching post, with two friendly cats sitting on it (cartoon style of the school cat).
const BASE = { s: 1.8, h: 0.06 };
const TALL = { x: -0.4, z: -0.4, top: 1.3, r: 0.1, perch: 0.7 };
const MID = { x: 0.3, z: 0.25, top: 0.8, perch: 0.8 };
const HOUSE = { x: 0.4, z: -0.5, s: 0.7, h: 0.5 };
const SCRATCH = { x: 0.7, z: 0.75, h: 0.7, r: 0.09 };

/** A sitting cat on a surface at `base`, facing yaw `yaw` (0 = +x), `k` times the school cat's size. */
function sittingCat(kit: StyleKit, base: Vec3, yaw: number, k: number, fur: PaletteColor, ear: PaletteColor): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  /** A point in the cat's own frame: f forward, u up, l to its left. */
  const at = (f: number, u: number, l: number): Vec3 => [base[0] + k * (f * c - l * s), base[1] + k * u, base[2] + k * (f * s + l * c)];
  const rot: Vec3 = [0, -yaw, 0];
  const sc = (x: number, y: number, z: number): Vec3 => [x * k, y * k, z * k];
  const head: [number, number, number] = [0.04, 0.45, 0.01];
  const hp = (f: number, u: number, l: number) => at(head[0] + f, head[1] + u, head[2] + l);
  const parts: Part[] = [
    kit.sphere(1, at(-0.04, 0.1, 0), fur, { scale: sc(0.18, 0.13, 0.18), rotate: rot }),
    kit.sphere(1, at(0, 0.23, 0), fur, { scale: sc(0.13, 0.15, 0.13), rotate: rot }),
    kit.sphere(1, at(0.085, 0.21, 0), 'white', { detail: 0, scale: sc(0.07, 0.12, 0.09), rotate: rot }),
    kit.sphere(1, at(...head), fur, { scale: sc(0.16, 0.154, 0.186), rotate: rot }),
    kit.sphere(1, hp(0.15, 0.028, -0.065), 'charcoal', { detail: 0, scale: sc(0.02, 0.036, 0.028), rotate: rot }),
    kit.sphere(1, hp(0.15, 0.028, 0.065), 'charcoal', { detail: 0, scale: sc(0.02, 0.036, 0.028), rotate: rot }),
    kit.sphere(1, hp(0.14, -0.05, 0), 'white', { detail: 0, scale: sc(0.08, 0.05, 0.08), rotate: rot }),
    kit.sphere(0.024 * k, hp(0.185, -0.025, 0), 'pink', { detail: 0 }),
    kit.sphere(1, at(0.15, 0.03, -0.06), 'white', { detail: 0, scale: sc(0.065, 0.04, 0.05), rotate: rot }),
    kit.sphere(1, at(0.15, 0.03, 0.06), 'white', { detail: 0, scale: sc(0.065, 0.04, 0.05), rotate: rot }),
    // tail: a curve of balls behind the cat, white tip
    kit.sphere(0.05 * k, at(-0.22, 0.08, 0.02), fur, { detail: 0 }),
    kit.sphere(0.047 * k, at(-0.3, 0.17, 0.04), fur, { detail: 0 }),
    kit.sphere(0.044 * k, at(-0.31, 0.27, 0.05), 'white', { detail: 0 }),
  ];
  for (const sd of [-1, 1]) {
    const rr: Vec3 = [sd * 0.3, -Math.PI / 2 - yaw, 0];
    parts.push(
      kit.cone(0.07 * k, 0.12 * k, hp(-0.01, 0.175 * 0.7 + 0.04, sd * 0.1), fur, { segments: 3, rotate: rr }),
      kit.cone(0.04 * k, 0.07 * k, hp(0.022, 0.175 * 0.7 + 0.02, sd * 0.106), ear, { segments: 3, rotate: rr }),
    );
  }
  return parts;
}

/** คอนโดแมว: a cat tree with platforms, a scratching post and two cats. */
export const item: ItemModel = {
  id: 'cat-tower',
  name: 'คอนโดแมว',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.s, BASE.h, BASE.s], [0, BASE.h / 2, 0], 'sand'),
      // tall post, wrapped in rope bands, with the top perch
      kit.cylinder(TALL.r, TALL.r, TALL.top - BASE.h, [TALL.x, (TALL.top + BASE.h) / 2, TALL.z], 'cream', { segments: 8 }),
      kit.box([TALL.perch, 0.07, TALL.perch], [TALL.x, TALL.top + 0.035, TALL.z], 'teal'),
      kit.box([TALL.perch + 0.04, 0.025, TALL.perch + 0.04], [TALL.x, TALL.top - 0.0125, TALL.z], 'woodDark'),
      // middle post and perch
      kit.cylinder(0.08, 0.08, MID.top - BASE.h, [MID.x, (MID.top + BASE.h) / 2, MID.z], 'cream', { segments: 8 }),
      kit.box([MID.perch, 0.07, MID.perch], [MID.x, MID.top + 0.035, MID.z], 'pink'),
      kit.box([MID.perch + 0.04, 0.025, MID.perch + 0.04], [MID.x, MID.top - 0.0125, MID.z], 'woodDark'),
      // the house: walls, a doorway facing +x and a flat top for a cat
      kit.box([HOUSE.s, HOUSE.h, HOUSE.s], [HOUSE.x, BASE.h + HOUSE.h / 2, HOUSE.z], 'skyBlue'),
      kit.box([HOUSE.s + 0.06, 0.06, HOUSE.s + 0.06], [HOUSE.x, BASE.h + HOUSE.h + 0.03, HOUSE.z], 'sunYellow'),
      kit.sphere(1, [HOUSE.x + HOUSE.s / 2, BASE.h + 0.2, HOUSE.z], 'charcoal', { detail: 0, scale: [0.02, 0.17, 0.16] }),
      // scratching post with a red ball on top
      kit.box([0.4, 0.04, 0.4], [SCRATCH.x, BASE.h + 0.02, SCRATCH.z], 'woodDark'),
      kit.cylinder(SCRATCH.r, SCRATCH.r, SCRATCH.h, [SCRATCH.x, BASE.h + 0.04 + SCRATCH.h / 2, SCRATCH.z], 'sand', { segments: 8 }),
      kit.sphere(0.07, [SCRATCH.x, BASE.h + 0.04 + SCRATCH.h + 0.05, SCRATCH.z], 'red', { detail: 0 }),
    ];
    for (const y of [0.35, 0.65, 0.95, 1.15]) {
      parts.push(kit.cylinder(TALL.r + 0.012, TALL.r + 0.012, 0.035, [TALL.x, y, TALL.z], 'woodDark', { segments: 8 }));
    }
    for (const y of [0.3, 0.55]) {
      parts.push(kit.cylinder(0.092, 0.092, 0.035, [MID.x, y, MID.z], 'woodDark', { segments: 8 }));
    }
    parts.push(
      ...sittingCat(kit, [TALL.x, TALL.top + 0.07, TALL.z], 0.4, 0.5, 'orange', 'pink'),
      ...sittingCat(kit, [MID.x, MID.top + 0.07, MID.z], 0.5, 0.45, 'cream', 'pink'),
    );
    return kit.finish(parts);
  },
};
