import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof, glassWindow } from '../../../models/parts';

const DECK = { y: 0.4, h: 0.06, x0: -0.95, x1: 0.75, z: 1.4 }; // veranda deck on stilts (top at y 0.43)
const DECK_TOP = DECK.y + DECK.h / 2;
const WALL = { cx: -0.15, w: 1.1, len: 2.1, h: 0.75 }; // house box, centred at x = cx
const WALL_TOP = DECK_TOP + WALL.h;
const RISE = 0.5;
const FRONT_X = WALL.cx + WALL.w / 2; // the +x wall (door side)

/** บ้านพักริมหาด: a wooden bungalow on stilts with a thatched roof, a veranda and steps down the front (+x). */
export const item: ItemModel = {
  id: 'beach-bungalow',
  name: 'บ้านพักริมหาด',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([DECK.x1 - DECK.x0, DECK.h, DECK.z * 2], [(DECK.x0 + DECK.x1) / 2, DECK.y, 0], 'wood'),
      kit.box([WALL.w, WALL.h, WALL.len], [WALL.cx, DECK_TOP + WALL.h / 2, 0], 'mint'),
      kit.wedge([WALL.w, RISE, WALL.len], [WALL.cx, WALL_TOP + RISE / 2, 0], 'mint'), // closes the gable ends
      ...gableRoof(kit, { at: [WALL.cx, WALL_TOP, 0], length: 2.5, width: WALL.w, rise: RISE, eave: 0.2, color: 'sand', ridge: 'wood' }),
      ...door(kit, { at: [FRONT_X, DECK_TOP + 0.23, 0], facing: 'x+', w: 0.3, h: 0.46, color: 'woodDark', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [FRONT_X, DECK_TOP + 0.4, 0.68], facing: 'x+', w: 0.3, h: 0.26 }),
      ...glassWindow(kit, { at: [FRONT_X, DECK_TOP + 0.4, -0.68], facing: 'x+', w: 0.3, h: 0.26 }),
      ...glassWindow(kit, { at: [WALL.cx, DECK_TOP + 0.4, WALL.len / 2], facing: 'z+', w: 0.4, h: 0.26 }),
      ...glassWindow(kit, { at: [WALL.cx, DECK_TOP + 0.4, -WALL.len / 2], facing: 'z-', w: 0.4, h: 0.26 }),
      ...glassWindow(kit, { at: [WALL.cx - WALL.w / 2, DECK_TOP + 0.4, 0], facing: 'x-', w: 0.5, h: 0.26 }),
      // two steps down from the deck edge
      kit.box([0.12, 0.29, 0.6], [0.81, 0.145, 0], 'woodDark'),
      kit.box([0.12, 0.15, 0.6], [0.93, 0.075, 0], 'woodDark'),
    ];
    // stilts
    for (const x of [-0.85, 0.0, 0.65]) {
      for (const z of [-1.3, 0, 1.3]) parts.push(kit.cylinder(0.05, 0.05, DECK.y - DECK.h / 2, [x, (DECK.y - DECK.h / 2) / 2, z], 'woodDark', { segments: 8 }));
    }
    // veranda rail along the +x edge, open in the middle for the steps
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([0.05, 0.04, 0.9], [0.72, DECK_TOP + 0.2, s * 0.85], 'woodDark'),
        kit.box([0.05, 0.2, 0.05], [0.72, DECK_TOP + 0.1, s * 0.4], 'woodDark'),
        kit.box([0.05, 0.2, 0.05], [0.72, DECK_TOP + 0.1, s * 1.3], 'woodDark'),
      );
    }
    return kit.finish(parts);
  },
};
