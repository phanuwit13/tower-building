import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

const SAND_H = 0.03;
const DECK = { w: 0.9, l: 1.9, y: 0.1, t: 0.04 }; // plank deck on two stringers
const PLANKS = 14;
const POST_X = 0.4; // rope-rail posts on the +x edge
const POST_Z = [-0.88, -0.3, 0.3, 0.88];
const POST_H = 0.5;
const BENCH = { x: -0.12, l: 1.1, seat: 0.42 }; // seat height above the ground
const DECK_TOP = DECK.y + DECK.t;

/** ม้านั่งทางเดินไม้: a short boardwalk section with a bench and a rope rail. */
export const item: ItemModel = {
  id: 'boardwalk-bench',
  name: 'ม้านั่งทางเดินไม้',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.96, SAND_H, 1.96], [0, SAND_H / 2, 0], 'sand')];
    for (const x of [-0.3, 0.3]) parts.push(kit.box([0.07, DECK.y - SAND_H, DECK.l], [x, SAND_H + (DECK.y - SAND_H) / 2, 0], 'woodDark'));
    const pw = DECK.l / PLANKS;
    for (let i = 0; i < PLANKS; i++) {
      parts.push(kit.box([DECK.w, DECK.t, pw - 0.015], [0, DECK.y + DECK.t / 2, -DECK.l / 2 + (i + 0.5) * pw], i % 2 ? 'wood' : 'sand'));
    }
    // bench: seat slats, legs, two back slats on tilted supports
    const seatY = BENCH.seat;
    parts.push(
      kit.box([0.14, 0.04, BENCH.l], [BENCH.x + 0.08, seatY, 0], 'wood'),
      kit.box([0.14, 0.04, BENCH.l], [BENCH.x - 0.08, seatY, 0], 'wood'),
      kit.box([0.04, 0.1, BENCH.l], [BENCH.x - 0.19, seatY + 0.2, 0], 'woodDark', { rotate: [0, 0, 0.12] }),
      kit.box([0.04, 0.1, BENCH.l], [BENCH.x - 0.205, seatY + 0.33, 0], 'wood', { rotate: [0, 0, 0.12] }),
    );
    for (const z of [-0.46, 0.46]) {
      parts.push(
        kit.box([0.3, 0.04, 0.05], [BENCH.x, seatY - 0.04, z], 'charcoal'),
        kit.box([0.04, seatY - DECK_TOP - 0.02, 0.05], [BENCH.x + 0.1, (seatY - 0.02 + DECK_TOP) / 2, z], 'charcoal'),
        kit.box([0.04, seatY - DECK_TOP - 0.02, 0.05], [BENCH.x - 0.1, (seatY - 0.02 + DECK_TOP) / 2, z], 'charcoal'),
        kit.box([0.035, 0.4, 0.04], [BENCH.x - 0.19, seatY + 0.2, z], 'charcoal', { rotate: [0, 0, 0.12] }),
      );
    }
    // rope rail on the +x edge: posts with round caps, and two sagging ropes between them
    for (const z of POST_Z) {
      parts.push(
        kit.cylinder(0.035, 0.04, POST_H, [POST_X, DECK_TOP + POST_H / 2, z], 'woodDark', { segments: 6 }),
        kit.sphere(0.045, [POST_X, DECK_TOP + POST_H + 0.02, z], 'sand', { detail: 0 }),
      );
    }
    for (let i = 0; i < POST_Z.length - 1; i++) {
      for (const [h, sag] of [[0.43, 0.06], [0.25, 0.04]]) {
        const y = DECK_TOP + h;
        const a: [number, number, number] = [POST_X, y, POST_Z[i]];
        const b: [number, number, number] = [POST_X, y, POST_Z[i + 1]];
        const m: [number, number, number] = [POST_X, y - sag, (a[2] + b[2]) / 2];
        parts.push(rod(kit, a, m, 0.016, 'sand', { segments: 4 }), rod(kit, m, b, 0.016, 'sand', { segments: 4 }));
      }
    }
    return kit.finish(parts);
  },
};
