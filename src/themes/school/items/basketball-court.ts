import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { wallPanel } from '../../../models/parts';

// A half court: the hoop stands at the back (-x) and faces the front (+x), so the default camera
// looks straight at the backboard over the court.
const APRON = { size: 1.96, h: 0.03 }; // concrete surround
const COURT = { size: 1.76, h: 0.04 }; // orange slab on the apron: y 0.02..0.06
const FLOOR = 0.06; // court surface
const KEY_H = 0.02; // painted key: top 0.01 above the court
const LINE = { w: 0.04, h: 0.03 }; // white lines: top 0.02 above the court
const HALF = 0.8; // boundary lines at x, z = ±HALF
const KEY = { len: 0.5, hw: 0.2 }; // from the baseline (x = -HALF) to the free-throw line
const BASKET_X = -0.6; // centre of the ring
const ARC_R = 0.62; // three-point arc around the basket
const CENTRE_R = 0.24; // half centre circle on the far (+x) line
const POLE = { x: -0.93, r: 0.045, top: 1.34, pad: 0.4 };
const BOARD = { x: -0.74, d: 0.04, h: 0.36, w: 0.54, y: 1.2 }; // white backboard; front face at x = -0.72
const RIM = { r: 0.1, tube: 0.018, y: 1.07 };
const NET = { h: 0.15, rBottom: 0.065 };
const BALL = { x: -0.5, z: 0.08, r: 0.075 };

/** สนามบาสเกตบอล: an orange half court with white lines, a blue key and a tall hoop with backboard and net. */
export const item: ItemModel = {
  id: 'basketball-court',
  name: 'สนามบาสเกตบอล',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const lineY = FLOOR - 0.01 + LINE.h / 2;
    const ftX = -HALF + KEY.len; // free-throw line
    const line = (sx: number, sz: number, x: number, z: number) => kit.box([sx, LINE.h, sz], [x, lineY, z], 'white');
    /** A flat white semicircle of radius r round (x, z), bulging towards +x (dir 1) or -x (dir -1). */
    const arc = (r: number, x: number, dir: 1 | -1) => kit.torus(r, LINE.w / 2, [x, FLOOR + 0.006, 0], 'white', {
      arc: Math.PI, rotate: [Math.PI / 2, 0, -dir * Math.PI / 2], scale: [1, 1, 0.6],
      radialSegments: 4, tubularSegments: Math.max(6, Math.round(r * 16)),
    });
    const parts: Part[] = [
      kit.box([APRON.size, APRON.h, APRON.size], [0, APRON.h / 2, 0], 'stone'),
      kit.box([COURT.size, COURT.h, COURT.size], [0, FLOOR - COURT.h / 2, 0], 'orange'),
      kit.box([KEY.len, KEY_H, 2 * KEY.hw], [-HALF + KEY.len / 2, FLOOR, 0], 'blue'),
      // free-throw line, key sides, the far line's half circle, the three-point arc and its straight ends
      line(LINE.w, 2 * KEY.hw + LINE.w, ftX, 0),
      arc(KEY.hw, ftX, 1),
      arc(ARC_R, BASKET_X, 1),
      arc(CENTRE_R, HALF, -1),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        line(LINE.w, 2 * HALF + LINE.w, s * HALF, 0), // baseline and far line
        line(2 * HALF + LINE.w, LINE.w, 0, s * HALF), // sidelines
        line(KEY.len, LINE.w, -HALF + KEY.len / 2, s * KEY.hw),
        line(BASKET_X + HALF, LINE.w, (BASKET_X - HALF) / 2, s * ARC_R),
      );
    }

    // the hoop: padded pole behind the baseline, an arm to the backboard, red ring and white net
    const ringX = BASKET_X;
    parts.push(
      kit.box([0.1, 0.05, 0.16], [POLE.x, 0.025, 0], 'stoneDark'),
      kit.cylinder(POLE.r, POLE.r, POLE.top - 0.05, [POLE.x, 0.05 + (POLE.top - 0.05) / 2, 0], 'navy', { segments: 8 }),
      kit.cylinder(POLE.r + 0.02, POLE.r + 0.02, POLE.pad, [POLE.x, 0.05 + POLE.pad / 2, 0], 'blue', { segments: 8 }),
      kit.sphere(POLE.r + 0.01, [POLE.x, POLE.top, 0], 'navy', { detail: 0 }),
      kit.box([BOARD.x - POLE.x, 0.06, 0.06], [(POLE.x + BOARD.x) / 2, BOARD.y + 0.06, 0], 'navy'), // arm
      kit.box([BOARD.x - POLE.x, 0.05, 0.05], [(POLE.x + BOARD.x) / 2, BOARD.y - 0.1, 0], 'navy'), // lower arm
      kit.box([0.03, BOARD.h + 0.04, BOARD.w + 0.04], [BOARD.x - 0.01, BOARD.y, 0], 'navy'), // board edge, behind
      kit.box([BOARD.d, BOARD.h, BOARD.w], [BOARD.x, BOARD.y, 0], 'white'),
      ...wallPanel(kit, { at: [BOARD.x + BOARD.d / 2, RIM.y + 0.1, 0], facing: 'x+', w: 0.2, h: 0.15, depth: 0.01, color: 'red' }),
      ...wallPanel(kit, { at: [BOARD.x + BOARD.d / 2, RIM.y + 0.1, 0], facing: 'x+', w: 0.13, h: 0.09, depth: 0.02, color: 'white' }),
      kit.box([ringX - RIM.r - (BOARD.x + BOARD.d / 2) + 0.01, 0.03, 0.06], [(ringX - RIM.r + BOARD.x + BOARD.d / 2) / 2, RIM.y, 0], 'red'),
      kit.torus(RIM.r, RIM.tube, [ringX, RIM.y, 0], 'red', { rotate: [Math.PI / 2, 0, 0], tubularSegments: 12, radialSegments: 5 }),
      kit.cylinder(RIM.r - 0.01, NET.rBottom, NET.h, [ringX, RIM.y - NET.h / 2 - 0.005, 0], 'white', { segments: 8 }),
    );

    // a basketball resting on the blue key, with two dark seams
    const ballAt: [number, number, number] = [BALL.x, FLOOR + KEY_H / 2 + BALL.r, BALL.z];
    parts.push(
      kit.sphere(BALL.r, ballAt, 'orange'),
      kit.torus(BALL.r, 0.012, ballAt, 'charcoal', { radialSegments: 4, tubularSegments: 10, rotate: [0, 0.5, 0] }),
      kit.torus(BALL.r, 0.012, ballAt, 'charcoal', { radialSegments: 4, tubularSegments: 10, rotate: [Math.PI / 2, 0, 0] }),
    );
    return kit.finish(parts);
  },
};
