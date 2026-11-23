import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A tiled swimming pool (long side along z) in a stone deck with a white coping. Steps lead into the water at
// the +z end with a chrome hand rail beside them; two orange loungers stand on the wide deck strip at the front (+x).
const DECK = { w: 1.92, d: 2.92, h: 0.1 };
const POOL = { x: -0.28, w: 1.1, d: 2.3 }; // the water (x, z), pushed to the back so the front deck is wide
const WATER_Y = 0.07;
const COPING = { w: 0.07, h: 0.025, over: 0.02 };
const TILE = { w: 0.06, h: 0.004 }; // blue tile lines on the pool floor, seen through the water
const STEP = { d: 0.2, h: [0.085, 0.077] }; // two steps, just proud of the water
const RAIL = { y: 0.42, r: 0.018 };
const LOUNGER = { x: 0.62, w: 0.34, len: 0.9, zs: [-0.65, 0.5], legH: 0.07, frameH: 0.04 };

/** สระน้ำริมหาด: a tiled pool with steps, a rail and two loungers. */
export const item: ItemModel = {
  id: 'beach-pool',
  name: 'สระน้ำริมหาด',
  category: 'play',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([POOL.w, WATER_Y, POOL.d], [POOL.x, WATER_Y / 2, 0], 'skyBlue', { motion: { kind: 'water', water: 'pool' } })];
    // deck: four strips round the pool
    const left = POOL.x - POOL.w / 2; // pool's -x edge
    const right = POOL.x + POOL.w / 2;
    const backW = left + DECK.w / 2;
    const frontW = DECK.w / 2 - right;
    const endD = (DECK.d - POOL.d) / 2;
    parts.push(
      kit.box([backW, DECK.h, DECK.d], [-DECK.w / 2 + backW / 2, DECK.h / 2, 0], 'stone'),
      kit.box([frontW, DECK.h, DECK.d], [DECK.w / 2 - frontW / 2, DECK.h / 2, 0], 'stone'),
      kit.box([POOL.w, DECK.h, endD], [POOL.x, DECK.h / 2, (POOL.d + endD) / 2], 'stone'),
      kit.box([POOL.w, DECK.h, endD], [POOL.x, DECK.h / 2, -(POOL.d + endD) / 2], 'stone'),
    );
    // white coping on all four edges
    const cw = COPING.w + COPING.over;
    for (const s of [1, -1]) {
      parts.push(
        kit.box([cw, COPING.h, POOL.d + 2 * COPING.w], [POOL.x + s * (POOL.w / 2 + (COPING.w - COPING.over) / 2), DECK.h + COPING.h / 2, 0], 'white'),
        kit.box([POOL.w - 2 * COPING.over, COPING.h, cw], [POOL.x, DECK.h + COPING.h / 2, s * (POOL.d / 2 + (COPING.w - COPING.over) / 2)], 'white'),
      );
    }
    // tile lines flush with the water surface (just proud of it so they do not z-fight)
    for (const z of [-0.8, -0.2, 0.4]) parts.push(kit.box([POOL.w - 0.1, TILE.h, TILE.w], [POOL.x, WATER_Y + TILE.h / 2, z], 'blue'));
    for (const dx of [-0.25, 0.25]) parts.push(kit.box([TILE.w, TILE.h, 1.5], [POOL.x + dx, WATER_Y + TILE.h / 2, -0.3], 'blue'));

    // steps at the +z end
    const stepZ = POOL.d / 2 - STEP.d / 2;
    parts.push(
      kit.box([POOL.w - 0.1, STEP.h[0], STEP.d], [POOL.x, STEP.h[0] / 2, stepZ], 'white'),
      kit.box([POOL.w - 0.1, STEP.h[1], STEP.d], [POOL.x, STEP.h[1] / 2, stepZ - STEP.d], 'stone'),
    );
    // hand rail on each side of the steps: a post on the deck and an arched bar over the water
    const railZ = POOL.d / 2 + 0.0;
    for (const s of [1, -1]) {
      const x = POOL.x + s * (POOL.w / 2 + 0.04); // on the side coping (x from w/2 - over to w/2 + w_c - over)
      const base = DECK.h + COPING.h; // top of the coping
      parts.push(
        rod(kit, [x, base, railZ + 0.03], [x, RAIL.y, railZ + 0.03], RAIL.r, 'chrome', { segments: 6 }),
        rod(kit, [x, RAIL.y, railZ + 0.03], [x, RAIL.y - 0.02, railZ - 0.34], RAIL.r, 'chrome', { segments: 6 }),
        rod(kit, [x, RAIL.y - 0.02, railZ - 0.34], [x, base, railZ - 0.34], RAIL.r, 'chrome', { segments: 6 }),
      );
    }

    // two loungers on the front deck: legs, a frame, a flat seat pad and a tilted back rest (back at -z)
    for (const z of LOUNGER.zs) {
      const top = DECK.h + LOUNGER.legH + LOUNGER.frameH;
      for (const dx of [-1, 1]) for (const dz of [-1, 1]) {
        parts.push(kit.box([0.04, LOUNGER.legH, 0.04], [LOUNGER.x + dx * 0.12, DECK.h + LOUNGER.legH / 2, z + dz * 0.34], 'wood'));
      }
      parts.push(
        kit.box([LOUNGER.w, LOUNGER.frameH, LOUNGER.len], [LOUNGER.x, DECK.h + LOUNGER.legH + LOUNGER.frameH / 2, z], 'wood'),
        kit.box([LOUNGER.w - 0.06, 0.03, 0.5], [LOUNGER.x, top + 0.015, z + 0.17], 'orange'),
        kit.box([LOUNGER.w - 0.06, 0.03, 0.34], [LOUNGER.x, top + 0.11, z - 0.27], 'orange', { rotate: [0.7, 0, 0] }),
      );
    }
    return kit.finish(parts);
  },
};
