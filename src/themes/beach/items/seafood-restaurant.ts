import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof, glassWindow } from '../../../models/parts';

const SAND_H = 0.03;
const DECK = { x0: -0.95, x1: 0.85, y: 0.2, t: 0.05 }; // plank deck on low stilts
const FLOOR = DECK.y + DECK.t; // 0.25
const WALL = { x: -0.42, w: 0.8, l: 2.2, h: 0.6 }; // the building takes the back half of the deck
const WALL_TOP = FLOOR + WALL.h;
const RISE = 0.5;
const FRONT = WALL.x + WALL.w / 2; // the +x wall face
const TABLES: Array<[number, number]> = [[0.38, -0.65], [0.38, 0.6]];
const SIGN = { x: 0.74, z: 1.15, y: 1.12 }; // the fish sign on a pole at the front corner

/** ร้านอาหารทะเล: a wooden restaurant on low stilts with a thatched roof, a fish sign and tables on the deck. */
export const item: ItemModel = {
  id: 'seafood-restaurant',
  name: 'ร้านอาหารทะเล',
  category: 'food',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const dw = DECK.x1 - DECK.x0;
    const parts: Part[] = [
      kit.box([1.96, SAND_H, 2.96], [0, SAND_H / 2, 0], 'sand'),
      kit.box([dw, DECK.t, 2.9], [(DECK.x0 + DECK.x1) / 2, DECK.y + DECK.t / 2, 0], 'wood'),
      kit.box([dw + 0.0, 0.03, 0.06], [(DECK.x0 + DECK.x1) / 2, DECK.y + 0.005, 1.42], 'woodDark'),
      kit.box([dw, 0.03, 0.06], [(DECK.x0 + DECK.x1) / 2, DECK.y + 0.005, -1.42], 'woodDark'),
    ];
    // stilts
    for (const x of [-0.85, -0.05, 0.75]) {
      for (const z of [-1.35, -0.45, 0.45, 1.35]) parts.push(kit.box([0.09, DECK.y - SAND_H, 0.09], [x, SAND_H + (DECK.y - SAND_H) / 2, z], 'woodDark'));
    }
    // building
    parts.push(
      kit.box([WALL.w, WALL.h, WALL.l], [WALL.x, FLOOR + WALL.h / 2, 0], 'cream'),
      kit.wedge([WALL.w, RISE, WALL.l], [WALL.x, WALL_TOP + RISE / 2, 0], 'cream'),
      ...gableRoof(kit, { at: [WALL.x, WALL_TOP, 0], length: 2.5, width: WALL.w, rise: RISE, eave: 0.1, color: 'brass', ridge: 'woodDark' }),
      ...door(kit, { at: [FRONT, FLOOR + 0.23, -0.1], facing: 'x+', w: 0.3, h: 0.46, color: 'woodDark', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [FRONT, FLOOR + 0.3, -0.75], facing: 'x+', w: 0.4, h: 0.26 }),
      ...glassWindow(kit, { at: [FRONT, FLOOR + 0.3, 0.7], facing: 'x+', w: 0.4, h: 0.26 }),
      ...glassWindow(kit, { at: [WALL.x - WALL.w / 2, FLOOR + 0.3, 0], facing: 'x-', w: 0.6, h: 0.26, panes: 3 }),
      ...glassWindow(kit, { at: [WALL.x, FLOOR + 0.3, WALL.l / 2], facing: 'z+', w: 0.4, h: 0.26 }),
      ...glassWindow(kit, { at: [WALL.x, FLOOR + 0.3, -WALL.l / 2], facing: 'z-', w: 0.4, h: 0.26 }),
      // a blue stripe above the front windows
      kit.box([0.02, 0.05, WALL.l], [FRONT + 0.005, WALL_TOP - 0.06, 0], 'blue'),
      // warm lamps under the front eave
      kit.sphere(0.04, [FRONT + 0.04, WALL_TOP - 0.1, -0.4], 'lampWarm', { detail: 0, glow: true }),
      kit.sphere(0.04, [FRONT + 0.04, WALL_TOP - 0.1, 0.35], 'lampWarm', { detail: 0, glow: true }),
    );
    // tables with a seafood plate, and three stools each
    for (const [tx, tz] of TABLES) {
      parts.push(
        kit.cylinder(0.03, 0.03, 0.26, [tx, FLOOR + 0.13, tz], 'woodDark', { segments: 6 }),
        kit.cylinder(0.17, 0.17, 0.035, [tx, FLOOR + 0.28, tz], 'blue', { segments: 8 }),
        kit.cylinder(0.07, 0.07, 0.015, [tx, FLOOR + 0.3, tz], 'white', { segments: 8 }),
        kit.sphere(0.035, [tx, FLOOR + 0.33, tz], 'orange', { detail: 0, scale: [1.5, 0.8, 1] }),
      );
      for (let k = 0; k < 3; k++) {
        const a = 1.0 + (k * Math.PI * 2) / 3;
        parts.push(kit.box([0.13, 0.15, 0.13], [tx + Math.cos(a) * 0.3, FLOOR + 0.075, tz - Math.sin(a) * 0.3], k % 2 ? 'orange' : 'red'));
      }
    }
    // railing along the front edge, with a gap for the step
    const RAIL_X = 0.83;
    for (const z of [-1.4, -1.0, -0.6, -0.25, 0.25, 0.6, 1.0, 1.4]) parts.push(kit.box([0.045, 0.26, 0.045], [RAIL_X, FLOOR + 0.13, z], 'woodDark'));
    parts.push(
      kit.box([0.035, 0.035, 1.17], [RAIL_X, FLOOR + 0.25, -0.825], 'wood'),
      kit.box([0.035, 0.035, 1.17], [RAIL_X, FLOOR + 0.25, 0.825], 'wood'),
      kit.box([0.14, 0.11, 0.5], [0.91, SAND_H + 0.055, 0], 'woodDark'), // step
      kit.box([0.1, 0.07, 0.5], [0.86, DECK.y - 0.035 + 0.0, 0], 'wood'),
    );
    // the fish-shaped sign: a pole, a flat orange fish (head towards +z), tail, fin, eye
    parts.push(
      kit.cylinder(0.03, 0.03, SIGN.y - FLOOR, [SIGN.x, FLOOR + (SIGN.y - FLOOR) / 2, SIGN.z], 'woodDark', { segments: 6 }),
      kit.sphere(1, [SIGN.x + 0.04, SIGN.y, SIGN.z], 'orange', { scale: [0.05, 0.14, 0.22] }),
      kit.cone(0.13, 0.17, [SIGN.x + 0.04, SIGN.y, SIGN.z - 0.3], 'red', { segments: 4, scale: [0.35, 1, 1], rotate: [Math.PI / 2, 0, 0] }),
      kit.cone(0.08, 0.12, [SIGN.x + 0.04, SIGN.y + 0.17, SIGN.z - 0.02], 'red', { segments: 4, scale: [0.35, 1, 1] }),
      kit.sphere(0.035, [SIGN.x + 0.085, SIGN.y + 0.03, SIGN.z + 0.13], 'white', { detail: 0 }),
      kit.sphere(0.018, [SIGN.x + 0.115, SIGN.y + 0.03, SIGN.z + 0.13], 'charcoal', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
