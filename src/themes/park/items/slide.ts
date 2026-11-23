import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { aim } from '../../../models/parts';

const G = 0.03;
// Side view from +x: ladder at the -z end, a small platform, then a wavy slide down to +z.
const DECK = { top: 0.8, t: 0.05, w: 0.44, z0: -0.8, z1: -0.38 };
const POST_R = 0.035;
const RAIL_TOP = DECK.top + 0.26;
const LADDER = { footZ: -0.9, w: 0.3, rail: 0.045, rungs: [0.2, 0.4, 0.6], rungR: 0.02 };
const BED = { w: 0.3, t: 0.04, wall: 0.035, lip: 0.08, endZ: 0.86, endY: G + 0.08, wave: 0.1, segments: 10 };

/** สไลเดอร์: a red ladder and blue platform with a wavy yellow slide that curves from side to side down to a rubber pad. */
export const item: ItemModel = {
  id: 'slide',
  name: 'สไลเดอร์',
  category: 'play',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.96, G, 1.96], [0, G / 2, 0], 'teal')];
    const deckLen = DECK.z1 - DECK.z0;
    const deckZ = (DECK.z0 + DECK.z1) / 2;
    const px = DECK.w / 2 - POST_R;
    for (const x of [-px, px]) {
      for (const z of [DECK.z0 + POST_R, DECK.z1 - POST_R]) {
        parts.push(kit.cylinder(POST_R, POST_R, RAIL_TOP - G, [x, G + (RAIL_TOP - G) / 2, z], 'blue', { segments: 8 }));
      }
      parts.push(
        kit.box([0.03, 0.15, deckLen - 2 * POST_R], [x, DECK.top + 0.075, deckZ], 'orange'),
        kit.box([0.05, 0.05, deckLen + 0.02], [x, RAIL_TOP - 0.025, deckZ], 'red'),
      );
    }
    parts.push(kit.box([DECK.w, DECK.t, deckLen], [0, DECK.top - DECK.t / 2, deckZ], 'sunYellow'));

    // ladder: two red rails leaning back from the ground to the deck rails, white rungs
    const rise = RAIL_TOP - G;
    const run = DECK.z0 - LADDER.footZ;
    const lean = Math.atan2(run, rise);
    const railLen = Math.hypot(run, rise);
    const lift = (LADDER.rail / 2) * Math.sin(lean);
    const zAt = (y: number) => LADDER.footZ + ((y - G) / rise) * run;
    for (const x of [-LADDER.w / 2, LADDER.w / 2]) {
      parts.push(kit.box([LADDER.rail, railLen, LADDER.rail], [x, G + rise / 2 + lift, (LADDER.footZ + DECK.z0) / 2], 'red', { rotate: [lean, 0, 0] }));
    }
    for (const y of LADDER.rungs) {
      parts.push(kit.cylinder(LADDER.rungR, LADDER.rungR, LADDER.w, [0, G + y, zAt(G + y)], 'white', { rotate: [0, 0, Math.PI / 2], segments: 6 }));
    }

    // wavy bed: straight pieces following an S-curve in height and a sine in plan (x)
    const z0 = DECK.z1 - 0.02;
    const startY = DECK.top - BED.t / 2;
    const pt = (u: number): Vec3 => [
      BED.wave * Math.sin(2 * Math.PI * u),
      BED.endY + (startY - BED.endY) * (1 + Math.cos(Math.PI * u)) / 2,
      z0 + u * (BED.endZ - z0),
    ];
    for (let i = 0; i < BED.segments; i++) {
      const a = pt(i / BED.segments);
      const b = pt((i + 1) / BED.segments);
      const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const len = Math.hypot(...d) + 0.05;
      const mid: Vec3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
      // box [thickness, along, width] aimed so its length follows the slope and its width stays level
      const turn = aim(d, 'y');
      const horiz = Math.hypot(d[0], d[2]);
      const side: Vec3 = [d[2] / horiz, 0, -d[0] / horiz]; // level, across the slope
      const n: Vec3 = [-d[1] * d[0] / Math.hypot(...d) / horiz, horiz / Math.hypot(...d), -d[1] * d[2] / Math.hypot(...d) / horiz]; // bed's up
      parts.push(kit.box([BED.t, len, BED.w], mid, 'sunYellow', { rotate: turn }));
      for (const s of [-1, 1]) {
        const o = (BED.w + BED.wall) / 2;
        const up = (BED.lip - BED.t) / 2;
        parts.push(kit.box([BED.lip, len, BED.wall], [mid[0] + s * side[0] * o + n[0] * up, mid[1] + n[1] * up, mid[2] + s * side[2] * o + n[2] * up], 'orange', { rotate: turn }));
      }
    }
    // a blue foot under the run-out and a leg under the middle
    const footTop = BED.endY - BED.t / 2;
    parts.push(kit.box([BED.w, footTop - G, 0.1], [0, G + (footTop - G) / 2, BED.endZ - 0.1], 'blue'));
    const mid = pt(0.5);
    const legTop = mid[1] - BED.t / 2 - 0.01;
    parts.push(kit.cylinder(0.03, 0.03, legTop - G, [mid[0], G + (legTop - G) / 2, mid[2]], 'blue', { segments: 8 }));
    return kit.finish(parts);
  },
};
