import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { barrelRoof, rod, wallPanel } from '../../../models/parts';

// A small open-air stage (2x3, long side along z), front facing +x: a wooden deck, a navy back wall with
// star panels and curtains, a red curved (barrel) roof over the back half, two speakers on the open apron
// and a string of bulbs drawn between the front posts that chase.
const DECK = { x: 1.8, z: 2.8, h: 0.2 }; // the stage floor, centred on the footprint
const WALL_TOP = DECK.h + 1.0; // wall and post tops
const BACK = { x: -0.85, t: 0.1 }; // back wall centre x and thickness
const ROOF = { x: -0.3, width: 1.2, length: 2.7, rise: 0.5, spring: 0.2 };
const POST = { r: 0.04, x: 0.25, z: 1.25 };
const SPEAKER = { x: 0.5, z: 1.05, w: 0.28, h: 0.5 };
const BULBS = 15;
const LIGHTS = { x: 0.33, top: 1.17, sag: 0.2 }; // the string: x, height at the posts, sag in the middle

/** เวทีกลางแจ้ง: a small stage with a curved roof, speakers and string lights that chase. */
export const item: ItemModel = {
  id: 'open-air-stage',
  name: 'เวทีกลางแจ้ง',
  category: 'decoration',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([DECK.x, DECK.h, DECK.z], [0, DECK.h / 2, 0], 'wood'),
      kit.box([DECK.x + 0.04, 0.05, DECK.z + 0.04], [0, 0.1, 0], 'sunYellow'), // trim band round the deck
      kit.box([DECK.x - 0.1, 0.02, DECK.z - 0.1], [0, DECK.h + 0.01, 0], 'woodDark'), // floorboards
      // two low steps down the front
      kit.box([0.1, 0.1, 0.8], [DECK.x / 2 + 0.05, 0.05, 0], 'stone'),
      // back wall, star panels, curtains
      kit.box([BACK.t, WALL_TOP - DECK.h, ROOF.length], [BACK.x, (WALL_TOP + DECK.h) / 2, 0], 'navy'),
      kit.box([0.1, 0.85, 0.5], [BACK.x + 0.1, DECK.h + 0.425, 1.0], 'redDark'),
      kit.box([0.1, 0.85, 0.5], [BACK.x + 0.1, DECK.h + 0.425, -1.0], 'redDark'),
      barrelRoof(kit, {
        at: [ROOF.x, WALL_TOP + ROOF.rise * Math.sin(ROOF.spring), 0],
        length: ROOF.length, width: ROOF.width, rise: ROOF.rise, spring: ROOF.spring, color: 'red', along: 'z',
        endWall: { color: 'cream', length: ROOF.length - 0.01 },
      }),
    ].flat();
    for (const z of [-0.4, 0, 0.4]) {
      parts.push(...wallPanel(kit, { at: [BACK.x + BACK.t / 2, DECK.h + 0.55, z], facing: 'x+', w: 0.2, h: 0.2, depth: 0.02, color: 'sunYellow' }));
    }
    for (const s of [1, -1]) {
      parts.push(kit.cylinder(POST.r, POST.r, WALL_TOP - DECK.h, [POST.x, (WALL_TOP + DECK.h) / 2, s * POST.z], 'white', { segments: 8 }));
      // a speaker on the apron: a dark cabinet with a big and a small round cone
      const sz = s * SPEAKER.z;
      parts.push(
        kit.box([SPEAKER.w, SPEAKER.h, SPEAKER.w], [SPEAKER.x, DECK.h + SPEAKER.h / 2, sz], 'charcoal'),
        kit.cylinder(0.09, 0.09, 0.02, [SPEAKER.x + SPEAKER.w / 2 + 0.005, DECK.h + 0.17, sz], 'chrome', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
        kit.cylinder(0.045, 0.045, 0.02, [SPEAKER.x + SPEAKER.w / 2 + 0.005, DECK.h + 0.4, sz], 'chrome', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      );
    }
    // the string of bulbs: a thin wire sagging between the front posts, a bulb at each step (still bulbs, a chase run)
    const bulb = (i: number): [number, number, number] => {
      const z = -POST.z + (2 * POST.z * i) / (BULBS - 1);
      return [LIGHTS.x, LIGHTS.top - LIGHTS.sag * (1 - (z / POST.z) ** 2), z];
    };
    for (let i = 0; i < BULBS; i++) {
      parts.push(kit.sphere(0.05, bulb(i), 'lampWarm', { detail: 0, glow: true, light: 'chase', chase: { index: i, count: BULBS } }));
      if (i > 0) parts.push(rod(kit, bulb(i - 1), bulb(i), 0.012, 'charcoal', { segments: 4 }));
    }
    return kit.finish(parts);
  },
};
