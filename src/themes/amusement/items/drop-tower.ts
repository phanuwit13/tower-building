import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const BASE = { w: 1.92, h: 0.05 }; // square stone pad
const TOWER = { w: 0.26, top: 3.0 }; // central column
const POSTS = { s: 0.08, off: 0.17 }; // four corner posts
const BANDS = { n: 6, from: 0.6, step: 0.43, w: 0.42, h: 0.05 }; // yellow cross bands up the tower
const CAP = { w: 0.5, h: 0.14, roof: 0.3 };
const RING = { y: 0.55, r: 0.68, h: 0.05 }; // seat platform round the column
const SEATS = { n: 8, r: 0.78, len: 0.22, w: 0.2, back: 0.2 };
const SEAT_COLORS: PaletteColor[] = ['red', 'orange'];
const BULBS = 7; // chase run up each face of the column, one bulb in each gap between the yellow bands
const BULB_R = 0.033;

/** หอคอยดิ่ง: a tall tower with a ring of seats near the bottom and chase lights running up all four faces. */
export const item: ItemModel = {
  id: 'drop-tower',
  name: 'หอคอยดิ่ง',
  category: 'ride',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.w], [0, BASE.h / 2, 0], 'stone'),
      kit.box([TOWER.w, TOWER.top - BASE.h, TOWER.w], [0, BASE.h + (TOWER.top - BASE.h) / 2, 0], 'white'),
    ];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        parts.push(kit.box([POSTS.s, TOWER.top - BASE.h, POSTS.s], [sx * POSTS.off, BASE.h + (TOWER.top - BASE.h) / 2, sz * POSTS.off], 'blue'));
      }
    }
    for (let k = 0; k < BANDS.n; k++) {
      parts.push(kit.box([BANDS.w, BANDS.h, BANDS.w], [0, BANDS.from + k * BANDS.step, 0], 'sunYellow'));
    }
    parts.push(
      kit.box([CAP.w, CAP.h, CAP.w], [0, TOWER.top + CAP.h / 2, 0], 'red'),
      kit.cone(CAP.w * 0.72, CAP.roof, [0, TOWER.top + CAP.h + CAP.roof / 2, 0], 'redDark', { segments: 4, rotate: [0, Math.PI / 4, 0] }),
      kit.sphere(0.06, [0, TOWER.top + CAP.h + CAP.roof + 0.04, 0], 'sunYellow', { detail: 0 }),
      // seat platform and a collar
      kit.cylinder(RING.r, RING.r, RING.h, [0, RING.y, 0], 'sunYellow', { segments: 12 }),
      kit.cylinder(RING.r * 0.5, RING.r * 0.5, 0.1, [0, RING.y - 0.075, 0], 'stoneDark', { segments: 8 }),
    );
    for (let k = 0; k < SEATS.n; k++) {
      const a = (k / SEATS.n) * Math.PI * 2;
      const color = SEAT_COLORS[k % SEAT_COLORS.length];
      const rotate: [number, number, number] = [0, a, 0];
      parts.push(
        kit.box([SEATS.len, 0.05, SEATS.w], [SEATS.r * Math.cos(a), RING.y + RING.h / 2 + 0.025, -SEATS.r * Math.sin(a)], color, { rotate }),
        // backrest on the inner side, so the riders face outwards
        kit.box([0.04, SEATS.back, SEATS.w], [(SEATS.r - SEATS.len / 2 + 0.02) * Math.cos(a), RING.y + RING.h / 2 + 0.05 + SEATS.back / 2, -(SEATS.r - SEATS.len / 2 + 0.02) * Math.sin(a)], color, { rotate }),
      );
    }
    // chase lights up the column, bottom to top, one run per face
    const faces: Array<[number, number]> = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    for (const [fx, fz] of faces) {
      for (let i = 0; i < BULBS; i++) {
        const y = BANDS.from - BANDS.step / 2 + i * BANDS.step; // midway between two bands
        const o = TOWER.w / 2 + BULB_R * 0.6;
        parts.push(kit.sphere(BULB_R, [fx * o, y, fz * o], 'lampWarm', { detail: 0, glow: true, light: 'chase', chase: { index: i, count: BULBS } }));
      }
    }
    return kit.finish(parts);
  },
};
