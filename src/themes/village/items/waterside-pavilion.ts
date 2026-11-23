import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { gableRoof } from '../../../models/parts';

// 2x2. A plain open wooden pavilion with a simple gable roof, on a pier of posts over the water.
// Water on the -x side and round the pier; the bank (+x) has two steps up to the deck, and a
// second flight goes down from the +z side into the water. No finials, no ornaments.
const WATER_TOP = 0.05;
const DECK_Y = 0.26; // top of the deck boards
const DECK = { x: -0.34, z: 0, w: 1.12, d: 1.2 }; // pier deck (centre and size)
const POST_H = 1.0;
const WALL_TOP = DECK_Y + POST_H;
const PX = DECK.w / 2 - 0.07; // post offsets from the deck centre
const PZ = DECK.d / 2 - 0.07;

/** ศาลาท่าน้ำ: an open wooden pavilion on a pier over water, with steps down to the water. */
export const item: ItemModel = {
  id: 'waterside-pavilion',
  name: 'ศาลาท่าน้ำ',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.98, 0.03, 1.98], [0, 0.015, 0], 'lime'),
      kit.box([1.4, 0.04, 1.94], [-0.3, 0.02, 0], 'sand'), // muddy rim
      kit.box([1.3, WATER_TOP, 1.84], [-0.3, WATER_TOP / 2, 0], 'navy', { motion: { kind: 'water', water: 'pond' } }),
    ];
    // piles under the deck
    for (const sx of [-1, 1]) for (const sz of [-1, 0, 1]) {
      parts.push(kit.cylinder(0.05, 0.055, DECK_Y - 0.04, [DECK.x + sx * (DECK.w / 2 - 0.08), (DECK_Y - 0.04) / 2, sz * (DECK.d / 2 - 0.08)], 'woodDark', { segments: 6 }));
    }
    // deck boards
    parts.push(kit.box([DECK.w, 0.06, DECK.d], [DECK.x, DECK_Y - 0.03, DECK.z], 'wood'));
    for (const dz of [-0.4, -0.13, 0.13, 0.4]) parts.push(kit.box([DECK.w, 0.012, 0.02], [DECK.x, DECK_Y + 0.0035, dz], 'woodDark'));
    // gangway from the bank onto the deck and two steps on the bank
    parts.push(
      kit.box([0.3, 0.05, 0.5], [DECK.x + DECK.w / 2 + 0.12, DECK_Y - 0.025, 0], 'wood'),
      kit.box([0.22, 0.17, 0.5], [0.62, 0.085, 0], 'woodDark'),
      kit.box([0.2, 0.1, 0.5], [0.83, 0.05, 0], 'wood'),
    );
    // steps down into the water from the +z side of the deck (solid blocks)
    parts.push(
      kit.box([0.5, 0.2, 0.13], [DECK.x, 0.1, DECK.d / 2 + 0.065], 'wood'),
      kit.box([0.5, 0.13, 0.13], [DECK.x, 0.065, DECK.d / 2 + 0.195], 'woodDark'),
      kit.box([0.5, 0.07, 0.13], [DECK.x, 0.035, DECK.d / 2 + 0.325], 'wood'),
    );
    // the four posts, beams, low rails (open on the bank side), a plain gable roof
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      parts.push(kit.cylinder(0.055, 0.06, POST_H, [DECK.x + sx * PX, DECK_Y + POST_H / 2, sz * PZ], 'wood', { segments: 8 }));
    }
    for (const sz of [-1, 1]) {
      parts.push(
        kit.box([DECK.w - 0.06, 0.06, 0.06], [DECK.x, WALL_TOP - 0.03, sz * PZ], 'woodDark'),
        kit.box([DECK.w - 0.1, 0.04, 0.04], [DECK.x, DECK_Y + 0.4, sz * PZ], 'wood'),
        kit.box([DECK.w - 0.1, 0.04, 0.04], [DECK.x, DECK_Y + 0.2, sz * PZ], 'wood'),
      );
    }
    parts.push(
      kit.box([0.06, 0.06, DECK.d - 0.06], [DECK.x - PX, WALL_TOP - 0.03, 0], 'woodDark'),
      kit.box([0.06, 0.06, DECK.d - 0.06], [DECK.x + PX, WALL_TOP - 0.03, 0], 'woodDark'),
      kit.box([0.04, 0.04, DECK.d - 0.1], [DECK.x - PX, DECK_Y + 0.4, 0], 'wood'),
      kit.box([0.04, 0.04, DECK.d - 0.1], [DECK.x - PX, DECK_Y + 0.2, 0], 'wood'),
      // a plain wooden bench along the back (-x) rail
      kit.box([0.2, 0.04, DECK.d - 0.3], [DECK.x - PX + 0.12, DECK_Y + 0.17, 0], 'sand'),
      kit.box([0.04, 0.17, 0.04], [DECK.x - PX + 0.12, DECK_Y + 0.085, 0.4], 'woodDark'),
      kit.box([0.04, 0.17, 0.04], [DECK.x - PX + 0.12, DECK_Y + 0.085, -0.4], 'woodDark'),
      ...gableRoof(kit, { at: [DECK.x, WALL_TOP, 0], length: 1.5, width: DECK.w - 0.14, rise: 0.48, eave: 0.08, color: 'terracotta', ridge: 'redDark', thickness: 0.07 }),
      // open gable ends: a plain wedge each side
      kit.wedge([DECK.w - 0.14, 0.48, 0.05], [DECK.x, WALL_TOP + 0.24, 0.55], 'cream'),
      kit.wedge([DECK.w - 0.14, 0.48, 0.05], [DECK.x, WALL_TOP + 0.24, -0.55], 'cream'),
    );
    // a pot of flowers on the bank and a bush
    parts.push(
      kit.cylinder(0.09, 0.07, 0.12, [0.74, 0.09, 0.7], 'terracotta', { segments: 8 }),
      kit.sphere(0.1, [0.74, 0.2, 0.7], 'leaf', { detail: 0 }),
      kit.sphere(0.04, [0.76, 0.29, 0.7], 'pink', { detail: 0 }),
      kit.sphere(0.2, [0.72, 0.19, -0.7], 'leaf', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.12, [0.66, 0.14, -0.78], 'leafDark', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
