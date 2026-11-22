import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A mini pitch: the long axis runs along z, with a goal at each z end. The camera sees it from the side (+x).
const TURF = { size: 1.96, h: 0.04 }; // the grass slab
const TOP = TURF.h; // turf surface
const BANDS = 7; // mown bands across the pitch; the odd ones are darker
const BAND_H = 0.01;
const LINE = { w: 0.045, h: 0.02 }; // painted lines stand 0.01 above the darker bands
const FIELD = { hx: 0.72, hz: 0.76 }; // half size of the marked field (touchlines at ±hx, goal lines at ±hz)
const CIRCLE_R = 0.24;
const SPOT_R = 0.04;
const BOX = { hw: 0.38, d: 0.24 }; // penalty box: half width (x), depth into the field (z)
const GOAL = { hw: 0.32, h: 0.4, depth: 0.2, post: 0.032 }; // mouth half width, crossbar height, net depth
const NET = { r: 0.012, xs: [-0.21, -0.105, 0, 0.105, 0.21], color: 'white' as PaletteColor };
const FLAG = { h: 0.3, r: 0.018, w: 0.1, flagH: 0.07 }; // corner flags
const BALL = { r: 0.065, at: [0.2, TOP + 0.065, -0.16] as Vec3 };

/** A round rod from a to b (net strands, slanted frame bars). */
function rod(kit: StyleKit, a: Vec3, b: Vec3, r: number, color: PaletteColor, segments = 4): Part {
  const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const len = Math.hypot(...d);
  const mid: Vec3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  return kit.cylinder(r, r, len, mid, color, { segments, rotate: [Math.atan2(d[2], d[1]), 0, -Math.asin(d[0] / len)] });
}

/** สนามฟุตบอลเล็ก: a mini football pitch with mown stripes, white lines, a ball and a netted goal at each end. */
export const item: ItemModel = {
  id: 'football-pitch',
  name: 'สนามฟุตบอลเล็ก',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const half = TURF.size / 2;
    const band = TURF.size / BANDS;
    const lineY = TOP + LINE.h / 2;
    const parts: Part[] = [kit.box([TURF.size, TURF.h, TURF.size], [0, TURF.h / 2, 0], 'leaf')];
    for (let i = 1; i < BANDS; i += 2) {
      parts.push(kit.box([TURF.size, BAND_H, band], [0, TOP + BAND_H / 2, -half + (i + 0.5) * band], 'leafDark'));
    }

    // white lines: touchlines, goal lines, halfway line, centre circle and spot, two penalty boxes
    const line = (sx: number, sz: number, x: number, z: number) => kit.box([sx, LINE.h, sz], [x, lineY, z], 'white');
    for (const s of [-1, 1]) {
      parts.push(
        line(LINE.w, 2 * FIELD.hz + LINE.w, s * FIELD.hx, 0),
        line(2 * FIELD.hx + LINE.w, LINE.w, 0, s * FIELD.hz),
        line(2 * BOX.hw, LINE.w, 0, s * (FIELD.hz - BOX.d)),
      );
      for (const sx of [-1, 1]) parts.push(line(LINE.w, BOX.d, sx * BOX.hw, s * (FIELD.hz - BOX.d / 2)));
    }
    parts.push(
      line(2 * FIELD.hx, LINE.w, 0, 0),
      // a flat ring: the tube is squashed to the line height, then laid flat
      kit.torus(CIRCLE_R, LINE.w / 2, [0, TOP + 0.008, 0], 'white',
        { rotate: [Math.PI / 2, 0, 0], scale: [1, 1, LINE.h / LINE.w], radialSegments: 4, tubularSegments: 16 }),
      kit.cylinder(SPOT_R, SPOT_R, LINE.h, [0, lineY, 0], 'white', { segments: 8 }),
    );

    // goals: white posts and crossbar on the goal line, frame and net slanting back to the ground
    for (const s of [-1, 1]) {
      const z0 = s * FIELD.hz;
      const z1 = s * (FIELD.hz + GOAL.depth);
      const top = TOP + GOAL.h;
      const foot = TOP + 0.015;
      for (const x of [-GOAL.hw, GOAL.hw]) {
        parts.push(
          kit.cylinder(GOAL.post, GOAL.post, GOAL.h, [x, TOP + GOAL.h / 2, z0], 'white', { segments: 6 }),
          rod(kit, [x, top, z0], [x, foot, z1], 0.02, 'white'),
          // side net: one level strand and one upright strand in the triangle
          kit.box([2 * NET.r, 2 * NET.r, GOAL.depth / 2], [x, TOP + GOAL.h / 2, z0 + (s * GOAL.depth) / 4], NET.color),
          kit.box([2 * NET.r, GOAL.h / 2, 2 * NET.r], [x, TOP + GOAL.h / 4, z0 + (s * GOAL.depth) / 2], NET.color),
        );
      }
      parts.push(
        kit.cylinder(GOAL.post, GOAL.post, 2 * (GOAL.hw + GOAL.post), [0, top, z0], 'white', { rotate: [0, 0, Math.PI / 2], segments: 6 }),
        kit.box([2 * GOAL.hw, 0.03, 0.03], [0, foot, z1], 'white'),
      );
      for (const x of NET.xs) parts.push(rod(kit, [x, top, z0], [x, foot, z1], NET.r, NET.color));
      for (const t of [1 / 3, 2 / 3]) {
        parts.push(kit.box([2 * GOAL.hw, 2 * NET.r, 2 * NET.r], [0, top + (foot - top) * t, z0 + (z1 - z0) * t], NET.color));
      }
    }

    // corner flags, red and yellow, each flag pointing out of the field
    const flags: PaletteColor[] = ['red', 'sunYellow', 'sunYellow', 'red'];
    let k = 0;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const x = sx * FIELD.hx;
        const z = sz * FIELD.hz;
        parts.push(
          kit.cylinder(FLAG.r, FLAG.r, FLAG.h, [x, TOP + FLAG.h / 2, z], 'white', { segments: 6 }),
          kit.box([FLAG.w, FLAG.flagH, 0.02], [x + (sx * FLAG.w) / 2, TOP + FLAG.h - FLAG.flagH / 2, z], flags[k++]),
        );
      }
    }

    // the ball, with a few dark patches
    parts.push(kit.sphere(BALL.r, BALL.at, 'white'));
    for (const [dx, dy, dz] of [[0, 1, 0], [0.75, 0.45, 0.45], [-0.2, 0.55, 0.8], [0.6, 0.4, -0.7]]) {
      const n = Math.hypot(dx, dy, dz);
      const at: Vec3 = [BALL.at[0] + (dx / n) * BALL.r, BALL.at[1] + (dy / n) * BALL.r, BALL.at[2] + (dz / n) * BALL.r];
      parts.push(kit.sphere(0.022, at, 'charcoal', { detail: 0 }));
    }
    return kit.finish(parts);
  },
};
