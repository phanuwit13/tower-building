import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A round blue tank with a pointed red lid on a railed deck, held up by four splayed steel legs with
// cross bracing. A white water drop (facing the default camera) says what is inside; the ladder runs up the
// +z side from the ground to the deck and on up the tank.
const FOOT = { size: 0.18, h: 0.08 }; // concrete footing under each leg
const LEG = { r: 0.05, foot: 0.74, top: 0.56 }; // legs run from (±foot, FOOT.h, ±foot) up to (±top, DECK.y, ±top)
const DECK = { half: 0.64, h: 0.05, y: 1.5 }; // square platform: underside at DECK.y
const DECK_TOP = DECK.y + DECK.h;
const BRACE = { r: 0.02, levels: [FOOT.h + 0.04, 0.8, DECK.y - 0.04] }; // X braces between these heights; level rings at the middle one
const RAIL = { y: 0.22, half: 0.61, post: 0.03 }; // deck railing
const TANK = { r: 0.5, h: 0.72, y0: DECK_TOP };
const BAND = { h: 0.045, out: 0.015, at: [0.09, 0.9] }; // white bands, as fractions of the tank height
const LID = { r: 0.55, h: 0.28 };
const DROP = { y: 0.3, r: 0.13, flat: 0.45, turn: Math.PI / 4 }; // ball this far up the tank, squashed flat against it, turned from +x towards +z to face the default camera
const LADDER = { hw: 0.11, foot: 0.82, step: 0.17 }; // ground ladder: rails ±hw from x = 0, feet at z = foot

/** A round rod from a to b. */
function rod(kit: StyleKit, a: Vec3, b: Vec3, r: number, color: PaletteColor, segments = 4): Part {
  const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const len = Math.hypot(...d);
  const mid: Vec3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  return kit.cylinder(r, r, len, mid, color, { segments, rotate: [Math.atan2(d[2], d[1]), 0, -Math.asin(d[0] / len)] });
}

/** ถังเก็บน้ำ: a tall water tower: a blue tank with a cone lid on four braced steel legs, with a ladder. */
export const item: ItemModel = {
  id: 'water-tower',
  name: 'ถังเก็บน้ำ',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    /** Where the leg on corner (sx, sz) is at height y. */
    const legAt = (sx: number, sz: number, y: number): Vec3 => {
      const t = (y - FOOT.h) / (DECK.y - FOOT.h);
      const c = LEG.foot + (LEG.top - LEG.foot) * t;
      return [sx * c, y, sz * c];
    };
    const corners: Array<[number, number]> = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
    for (const [sx, sz] of corners) {
      parts.push(
        kit.box([FOOT.size, FOOT.h, FOOT.size], [sx * LEG.foot, FOOT.h / 2, sz * LEG.foot], 'stone'),
        rod(kit, legAt(sx, sz, FOOT.h), legAt(sx, sz, DECK.y), LEG.r, 'stoneDark', 8),
      );
    }
    // bracing on each side: an X in each storey and a level bar at the middle
    corners.forEach(([ax, az], i) => {
      const [bx, bz] = corners[(i + 1) % 4];
      const [y0, y1, y2] = BRACE.levels;
      parts.push(
        rod(kit, legAt(ax, az, y0), legAt(bx, bz, y1), BRACE.r, 'stoneDark'),
        rod(kit, legAt(bx, bz, y0), legAt(ax, az, y1), BRACE.r, 'stoneDark'),
        rod(kit, legAt(ax, az, y1), legAt(bx, bz, y2), BRACE.r, 'stoneDark'),
        rod(kit, legAt(bx, bz, y1), legAt(ax, az, y2), BRACE.r, 'stoneDark'),
        rod(kit, legAt(ax, az, y1), legAt(bx, bz, y1), BRACE.r + 0.01, 'stoneDark'),
      );
    });

    // deck with a railing (a gap on the +z side where the ladder comes up)
    const railY = DECK_TOP + RAIL.y;
    parts.push(kit.box([2 * DECK.half, DECK.h, 2 * DECK.half], [0, DECK.y + DECK.h / 2, 0], 'stoneDark'));
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([0.04, 0.04, 2 * RAIL.half], [s * RAIL.half, railY, 0], 'white'),
        kit.box([2 * RAIL.half, 0.04, 0.04], [0, railY, -RAIL.half], 'white'),
        kit.box([RAIL.half - LADDER.hw - 0.02, 0.04, 0.04], [s * (RAIL.half + LADDER.hw + 0.02) / 2, railY, RAIL.half], 'white'),
      );
      for (const sz of [-1, 1]) {
        parts.push(kit.box([RAIL.post, RAIL.y, RAIL.post], [s * RAIL.half, DECK_TOP + RAIL.y / 2, sz * RAIL.half], 'white'));
      }
    }

    // tank, white bands, cone lid and a water drop on the front
    const tankMid = TANK.y0 + TANK.h / 2;
    const tankTop = TANK.y0 + TANK.h;
    parts.push(
      kit.cylinder(TANK.r, TANK.r, TANK.h, [0, tankMid, 0], 'blue', { segments: 16 }),
      kit.cone(LID.r, LID.h, [0, tankTop + LID.h / 2, 0], 'red', { segments: 16 }),
      kit.sphere(0.055, [0, tankTop + LID.h + 0.02, 0], 'white', { detail: 0 }),
    );
    for (const f of BAND.at) {
      const r = TANK.r + BAND.out;
      parts.push(kit.cylinder(r, r, BAND.h, [0, TANK.y0 + TANK.h * f, 0], 'white', { segments: 16 }));
    }
    const dropY = TANK.y0 + DROP.y;
    const onTank = (y: number): Vec3 => [(TANK.r - 0.005) * Math.cos(DROP.turn), y, (TANK.r - 0.005) * Math.sin(DROP.turn)];
    const flat = { scale: [DROP.flat, 1, 1] as Vec3, rotate: [0, -DROP.turn, 0] as Vec3 };
    parts.push(
      kit.sphere(DROP.r, onTank(dropY), 'white', flat),
      kit.cone(DROP.r * 0.82, DROP.r * 1.3, onTank(dropY + DROP.r * 0.95), 'white', { ...flat, segments: 8 }),
    );

    // ladder up the +z side: from the ground to the deck, then up the tank wall
    const ladder = (zBottom: number, zTop: number, yBottom: number, yTop: number, step: number) => {
      for (const x of [-LADDER.hw, LADDER.hw]) parts.push(rod(kit, [x, yBottom, zBottom], [x, yTop, zTop], 0.018, 'white'));
      for (let y = yBottom + step; y < yTop - 0.04; y += step) {
        const z = zBottom + ((zTop - zBottom) * (y - yBottom)) / (yTop - yBottom);
        parts.push(kit.box([2 * LADDER.hw, 0.025, 0.025], [0, y, z], 'white'));
      }
    };
    ladder(LADDER.foot, DECK.half + 0.02, 0.02, railY, LADDER.step);
    ladder(TANK.r + 0.05, TANK.r + 0.05, DECK_TOP, tankTop + 0.06, LADDER.step);
    return kit.finish(parts);
  },
};
