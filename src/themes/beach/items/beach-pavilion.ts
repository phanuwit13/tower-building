import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { gableRoof } from '../../../models/parts';

// A plain open beach shelter: a timber deck on four posts, a pitched terracotta roof (ridge along z),
// a bench along each long side and two steps at the front (+x).
const DECK = { w: 1.7, d: 1.7, h: 0.12 };
const POST = { off: 0.72, w: 0.09, h: 1.1 };
const WALL_TOP = DECK.h + POST.h;
const BENCH = { x: 0.52, len: 1.1, seat: 0.3, seatY: 0.4, thick: 0.05 };

/** ศาลาไม้: an open wooden pavilion with a pitched roof and benches. */
export const item: ItemModel = {
  id: 'beach-pavilion',
  name: 'ศาลาไม้',
  category: 'seating',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([DECK.w, DECK.h, DECK.d], [0, DECK.h / 2, 0], 'wood')];
    parts.push(kit.box([0.14, 0.06, 0.7], [DECK.w / 2 + 0.07, 0.03, 0], 'woodDark')); // front step
    for (const sx of [1, -1]) {
      for (const sz of [1, -1]) {
        parts.push(kit.box([POST.w, POST.h, POST.w], [sx * POST.off, DECK.h + POST.h / 2, sz * POST.off], 'woodDark'));
      }
      // beams: along z on each side
      parts.push(kit.box([0.07, 0.08, POST.off * 2 + POST.w], [sx * POST.off, WALL_TOP - 0.04, 0], 'wood'));
      parts.push(kit.box([POST.off * 2 + POST.w, 0.07, 0.07], [0, WALL_TOP - 0.04, sx * POST.off], 'wood'));
      // bench: seat, two legs and a low back rail against the post line
      parts.push(
        kit.box([BENCH.seat, BENCH.thick, BENCH.len], [sx * BENCH.x, BENCH.seatY, 0], 'sand'),
        kit.box([0.05, BENCH.seatY - DECK.h, 0.28], [sx * BENCH.x, DECK.h + (BENCH.seatY - DECK.h) / 2, 0.38], 'woodDark'),
        kit.box([0.05, BENCH.seatY - DECK.h, 0.28], [sx * BENCH.x, DECK.h + (BENCH.seatY - DECK.h) / 2, -0.38], 'woodDark'),
      );
    }
    parts.push(...gableRoof(kit, { at: [0, WALL_TOP, 0], length: 1.9, width: 1.62, rise: 0.42, eave: 0.12, color: 'terracotta', ridge: 'redDark', along: 'z' }));
    return kit.finish(parts);
  },
};
