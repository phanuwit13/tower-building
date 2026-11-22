import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A rectangular pool, long side along z, in a stone deck with a white coping. Two red-and-white lane
// ropes split it into three lanes (blue lines on the floor), a ladder hooks over the front (+x) edge,
// starting blocks stand at the +z end and a red-and-white ring buoy hangs on a post at the front corner.
const DECK = { w: 1.92, d: 2.92, h: 0.1 }; // stone surround
const POOL = { w: 1.2, d: 2.2 }; // the water (x, z), centred
const WATER_Y = 0.07; // water surface, a little below the deck
const COPING = { w: 0.07, h: 0.025, over: 0.02 }; // white rim on the deck; `over` = how far it overhangs the water
const LANE_X = [-0.4, 0, 0.4]; // lane centres
const LINE = { w: 0.06, h: 0.012, len: 1.8 }; // dark lane line on the pool floor, seen through the water
const ROPE = { x: [-0.2, 0.2], r: 0.032, beads: 9 }; // floats on each lane rope, alternating red and white (odd: red at both ends)
const LADDER = { z: [0.48, 0.74], top: 0.34, bend: 0.09, r: 0.018 }; // two rails hooked over the +x edge; `bend` = radius of the hook
const STARTING_BLOCK = { w: 0.2, h: 0.18, d: 0.18 }; // one per lane, at the +z end
const BUOY = { x: 0.76, z: 1.22, y: 0.42, r: 0.13, tube: 0.045, post: 0.62 }; // ring on a post at the front (+x, +z) corner

/** สระว่ายน้ำ: the school swimming pool, with lane ropes, a ladder, starting blocks and a ring buoy. */
export const item: ItemModel = {
  id: 'swimming-pool',
  name: 'สระว่ายน้ำ',
  category: 'facility',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const sideW = (DECK.w - POOL.w) / 2; // deck strip along each long side
    const endD = (DECK.d - POOL.d) / 2; // deck strip across each end
    const parts: Part[] = [kit.box([POOL.w, WATER_Y, POOL.d], [0, WATER_Y / 2, 0], 'skyBlue', { motion: { kind: 'water', water: 'pool' } })];
    for (const s of [1, -1]) {
      parts.push(
        kit.box([sideW, DECK.h, DECK.d], [s * (POOL.w + sideW) / 2, DECK.h / 2, 0], 'stone'),
        kit.box([POOL.w, DECK.h, endD], [0, DECK.h / 2, s * (POOL.d + endD) / 2], 'stone'),
        // white coping round the pool edge
        kit.box([COPING.w + COPING.over, COPING.h, POOL.d + 2 * COPING.w], [s * (POOL.w / 2 + (COPING.w - COPING.over) / 2), DECK.h + COPING.h / 2, 0], 'white'),
        kit.box([POOL.w - 2 * COPING.over, COPING.h, COPING.w + COPING.over], [0, DECK.h + COPING.h / 2, s * (POOL.d / 2 + (COPING.w - COPING.over) / 2)], 'white'),
      );
    }
    for (const x of LANE_X) parts.push(kit.box([LINE.w, LINE.h, LINE.len], [x, WATER_Y + LINE.h / 2, 0], 'blue'));

    // lane ropes: a row of floats half under the water, tied to a hook in the coping at each end
    const bead = POOL.d / ROPE.beads;
    for (const x of ROPE.x) {
      for (let i = 0; i < ROPE.beads; i++) {
        const color: PaletteColor = i % 2 === 0 ? 'red' : 'white';
        parts.push(kit.cylinder(ROPE.r, ROPE.r, bead, [x, WATER_Y + 0.01, -POOL.d / 2 + bead * (i + 0.5)], color, { rotate: [Math.PI / 2, 0, 0], segments: 6 }));
      }
      for (const s of [1, -1]) parts.push(kit.box([0.05, 0.05, 0.05], [x, DECK.h + COPING.h + 0.02, s * (POOL.d / 2 + 0.02)], 'stoneDark'));
    }

    // the ladder: each rail rises out of the water, hooks over the coping and comes down onto the deck
    const inX = POOL.w / 2 - LADDER.bend; // in the water
    const outX = POOL.w / 2 + LADDER.bend; // on the deck
    for (const z of LADDER.z) {
      parts.push(
        kit.cylinder(LADDER.r, LADDER.r, LADDER.top - WATER_Y + 0.02, [inX, (LADDER.top + WATER_Y - 0.02) / 2, z], 'white', { segments: 6 }),
        kit.cylinder(LADDER.r, LADDER.r, LADDER.top - DECK.h, [outX, (LADDER.top + DECK.h) / 2, z], 'white', { segments: 6 }),
        kit.torus(LADDER.bend, LADDER.r, [POOL.w / 2, LADDER.top, z], 'white', { arc: Math.PI, radialSegments: 4, tubularSegments: 6 }),
        kit.box([0.06, 0.012, 0.06], [outX, DECK.h + 0.006, z], 'stoneDark'), // foot plate
      );
    }
    const ladderZ = (LADDER.z[0] + LADDER.z[1]) / 2;
    const ladderW = LADDER.z[1] - LADDER.z[0];
    for (const y of [WATER_Y + 0.07, WATER_Y + 0.17]) parts.push(kit.box([0.05, 0.02, ladderW], [inX - 0.02, y, ladderZ], 'stone')); // rungs above the water

    // starting blocks at the +z end, one per lane: a white stand with a blue top tilted towards the water
    const blockZ = POOL.d / 2 + COPING.w + STARTING_BLOCK.d / 2;
    for (const x of LANE_X) {
      parts.push(
        kit.box([STARTING_BLOCK.w, STARTING_BLOCK.h, STARTING_BLOCK.d], [x, DECK.h + STARTING_BLOCK.h / 2, blockZ], 'white'),
        kit.box([STARTING_BLOCK.w + 0.02, 0.03, STARTING_BLOCK.d + 0.04], [x, DECK.h + STARTING_BLOCK.h + 0.01, blockZ - 0.01], 'blue', { rotate: [-0.15, 0, 0] }), // lower at the water's side
      );
    }

    // ring buoy: four quarter rings, red and white, hanging on a post and facing the camera corner (+x, +z)
    parts.push(
      kit.box([0.05, BUOY.post, 0.05], [BUOY.x - 0.06, DECK.h + BUOY.post / 2, BUOY.z - 0.06], 'white'),
      kit.box([0.05, 0.05, 0.05], [BUOY.x - 0.03, BUOY.y + BUOY.r - 0.01, BUOY.z - 0.03], 'white'), // the peg it hangs on
    );
    for (let k = 0; k < 4; k++) {
      parts.push(kit.torus(BUOY.r, BUOY.tube, [BUOY.x, BUOY.y, BUOY.z], k % 2 === 0 ? 'red' : 'white', { arc: Math.PI / 2, rotate: [0, Math.PI / 4, (k * Math.PI) / 2] }));
    }
    return kit.finish(parts);
  },
};
