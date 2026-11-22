import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { gableRoof } from '../../../models/parts';

// A cubic climbing frame of teal bars. The back half (-x) is a little tower: a plank deck at the
// top with guard rails and a small yellow roof. The front half has monkey bars across the top,
// a rope ladder hangs from the front (+x) and a climbing net slopes down the +z side.
const HALF = 0.68; // frame corners at x, z = ±HALF
const BAR = { r: 0.04, seg: 6 };
const MID_Y = 0.48; // middle rails
const TOP_Y = 0.96; // top rails and deck
const TOWER_Y = 1.44; // the tower posts carry the roof up to here
const GUARD_Y = TOP_Y + 0.3; // guard rails round the deck
const MONKEY_X = [0.17, 0.34, 0.51]; // monkey bars across the open top
const DECK = { h: 0.05 };
const ROOF = { rise: 0.3, eave: 0.06, end: 0.08 }; // little gable roof over the tower, ridge along z; `end` past the end posts
const NET = { out: 0.96, r: 0.016, xs: [-0.6, -0.3, 0, 0.3, 0.6], rows: [0.25, 0.5, 0.75], color: 'red' as PaletteColor };
const LADDER = { out: 0.9, z: 0.18, rungs: [0.2, 0.4, 0.6, 0.8], rope: 0.02 };
const FOOT_Y = 0.03; // where ropes meet the ground

/** A round rod from a to b. */
function rod(kit: StyleKit, a: Vec3, b: Vec3, r: number, color: PaletteColor, segments = 4): Part {
  const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const len = Math.hypot(...d);
  const mid: Vec3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  return kit.cylinder(r, r, len, mid, color, { segments, rotate: [Math.atan2(d[2], d[1]), 0, -Math.asin(d[0] / len)] });
}

/** A point part way (t) from a to b. */
const lerp = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** โครงปีนเล่น: a teal climbing frame with monkey bars, a rope ladder, a climbing net and a yellow-roofed lookout deck. */
export const item: ItemModel = {
  id: 'jungle-gym',
  name: 'โครงปีนเล่น',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    const post = (x: number, z: number, top: number) =>
      parts.push(kit.cylinder(BAR.r, BAR.r, top, [x, top / 2, z], 'teal', { segments: BAR.seg }));
    const railX = (y: number, z: number, x0: number, x1: number) =>
      parts.push(kit.cylinder(BAR.r, BAR.r, x1 - x0, [(x0 + x1) / 2, y, z], 'teal', { rotate: [0, 0, Math.PI / 2], segments: BAR.seg }));
    const railZ = (y: number, x: number) =>
      parts.push(kit.cylinder(BAR.r, BAR.r, 2 * HALF, [x, y, 0], 'teal', { rotate: [Math.PI / 2, 0, 0], segments: BAR.seg }));

    // frame: front posts reach the top rail, the tower posts (x = 0 and back) reach the roof
    for (const s of [-1, 1]) {
      post(HALF, s * HALF, TOP_Y);
      post(0, s * HALF, TOWER_Y);
      post(-HALF, s * HALF, TOWER_Y);
      for (const y of [MID_Y, TOP_Y]) railX(y, s * HALF, -HALF, HALF);
      railX(GUARD_Y, s * HALF, -HALF, 0);
    }
    for (const y of [MID_Y, TOP_Y]) {
      railZ(y, HALF);
      railZ(y, -HALF);
    }
    railZ(TOP_Y, 0);
    railZ(GUARD_Y, -HALF);
    railZ(TOWER_Y, 0); // the roof rests on these two
    railZ(TOWER_Y, -HALF);
    for (const x of MONKEY_X) railZ(TOP_Y, x);
    for (const s of [-1, 1]) parts.push(kit.sphere(0.06, [HALF, TOP_Y + 0.02, s * HALF], 'sunYellow', { detail: 0 }));

    // tower: plank deck on the top rails and a little yellow roof on the tower posts
    parts.push(
      kit.box([HALF + 0.04, DECK.h, 2 * HALF + 0.04], [-HALF / 2, TOP_Y + BAR.r - DECK.h / 2 + 0.01, 0], 'wood'),
      ...gableRoof(kit, { at: [-HALF / 2, TOWER_Y + BAR.r, 0], length: 2 * HALF + 2 * ROOF.end, width: HALF + 2 * BAR.r,
        rise: ROOF.rise, eave: ROOF.eave, color: 'sunYellow', ridge: 'orange' }),
    );

    // climbing net down the +z side: strands from the top rail to a log on the ground
    const netTop = (x: number): Vec3 => [x, TOP_Y, HALF];
    const netFoot = (x: number): Vec3 => [x, FOOT_Y, NET.out];
    for (const x of NET.xs) parts.push(rod(kit, netTop(x), netFoot(x), NET.r, NET.color));
    for (const t of NET.rows) {
      const a = lerp(netTop(NET.xs[0]), netFoot(NET.xs[0]), t);
      parts.push(kit.box([NET.xs[4] - NET.xs[0], 2 * NET.r, 2 * NET.r], [0, a[1], a[2]], NET.color));
    }
    parts.push(kit.cylinder(0.035, 0.035, 2 * NET.xs[4] + 0.12, [0, 0.035, NET.out], 'woodDark', { rotate: [0, 0, Math.PI / 2], segments: 6 }));

    // rope ladder down the front (+x), from the top rail to a peg board on the ground
    const ropeTop = (z: number): Vec3 => [HALF, TOP_Y, z];
    const ropeFoot = (z: number): Vec3 => [LADDER.out, FOOT_Y, z];
    for (const z of [-LADDER.z, LADDER.z]) parts.push(rod(kit, ropeTop(z), ropeFoot(z), LADDER.rope, 'sand'));
    for (const t of LADDER.rungs) {
      const p = lerp(ropeTop(0), ropeFoot(0), t);
      parts.push(kit.box([0.05, 0.035, 2 * LADDER.z + 0.08], p, 'orange'));
    }
    parts.push(kit.box([0.08, 0.04, 2 * LADDER.z + 0.12], [LADDER.out, 0.02, 0], 'woodDark'));
    return kit.finish(parts);
  },
};
