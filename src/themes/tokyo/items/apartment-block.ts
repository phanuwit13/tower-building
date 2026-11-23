import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, glassWindow, rod } from '../../../models/parts';

// A tall apartment block: five storeys, a balcony in front of every window with an air-con unit on
// its wall and, on some, a laundry pole with clothes. A pink neon heart over the entrance.
const PAD = 0.03;
const BX = -0.15; // body centre x
const W = 1.3; // along x
const D = 2.56; // along z
const FRONT = BX + W / 2; // 0.5
const FLOOR_H = 0.58;
const GROUND_H = 0.5;
const TOP = PAD + GROUND_H + 4 * FLOOR_H; // 2.85
const BAYS = [-0.82, 0, 0.82];
const CLOTHES: PaletteColor[] = ['pink', 'skyBlue', 'sunYellow', 'white', 'lime'];

/** A balcony on the +x face at height y (slab top), centred on z. */
function balcony(kit: StyleKit, y: number, z: number, withPole: boolean, seed: number): Part[] {
  const depth = 0.3;
  const x = FRONT + depth / 2;
  const w = 0.62;
  const parts: Part[] = [
    kit.box([depth, 0.04, w], [x, y - 0.02, z], 'stone'),
    kit.box([0.025, 0.14, w], [FRONT + depth - 0.0125, y + 0.07, z], 'chrome'), // front rail
    kit.box([depth, 0.14, 0.025], [x, y + 0.07, z - w / 2 + 0.0125], 'chrome'),
    kit.box([depth, 0.14, 0.025], [x, y + 0.07, z + w / 2 - 0.0125], 'chrome'),
  ];
  if (withPole) {
    // a laundry pole on two posts with four clothes hanging
    const py = y + 0.3;
    for (const dz of [-w / 2 + 0.03, w / 2 - 0.03]) parts.push(kit.box([0.03, 0.3, 0.03], [FRONT + depth - 0.05, y + 0.15, z + dz], 'stoneDark'));
    parts.push(kit.cylinder(0.015, 0.015, w, [FRONT + depth - 0.05, py, z], 'stoneDark', { segments: 4, rotate: [Math.PI / 2, 0, 0] }));
    for (let i = 0; i < 4; i++) {
      parts.push(kit.box([0.02, 0.15 - (i % 2) * 0.03, 0.09], [FRONT + depth - 0.05, py - 0.09, z - 0.21 + i * 0.14], CLOTHES[(seed + i) % CLOTHES.length]));
    }
  } else {
    // an air-con unit on the wall: white box with a grille
    parts.push(
      kit.box([0.1, 0.1, 0.2], [FRONT + 0.05, y + 0.07, z - 0.14], 'white'),
      kit.box([0.02, 0.07, 0.14], [FRONT + 0.11, y + 0.07, z - 0.14], 'stoneDark'),
    );
  }
  return parts;
}

/** อพาร์ตเมนต์: a tall apartment block with balconies, air-con units and laundry poles. */
export const item: ItemModel = {
  id: 'apartment-block',
  name: 'อพาร์ตเมนต์',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.96, PAD, 2.96], [0, PAD / 2, 0], 'stone'),
      kit.box([W, TOP - PAD, D], [BX, (PAD + TOP) / 2, 0], 'cream'),
      kit.box([W + 0.1, 0.08, D + 0.1], [BX, TOP + 0.04, 0], 'stoneDark'), // roof slab
      kit.box([W - 0.1, 0.1, 0.06], [BX, TOP + 0.13, D / 2 - 0.03], 'cream'), // parapet
      kit.box([W - 0.1, 0.1, 0.06], [BX, TOP + 0.13, -D / 2 + 0.03], 'cream'),
      kit.box([0.06, 0.1, D - 0.1], [BX - W / 2 + 0.03, TOP + 0.13, 0], 'cream'),
      kit.box([0.06, 0.1, D - 0.1], [BX + W / 2 - 0.03, TOP + 0.13, 0], 'cream'),
      // roof: water tank and a stair hut
      kit.cylinder(0.2, 0.2, 0.3, [BX - 0.2, TOP + 0.27, -0.7], 'chrome', { segments: 8 }),
      kit.cone(0.22, 0.12, [BX - 0.2, TOP + 0.48, -0.7], 'redDark', { segments: 8 }),
      kit.box([0.4, 0.3, 0.4], [BX - 0.25, TOP + 0.23, 0.6], 'terracotta'),
      kit.box([0.1, 0.1, 0.06], [BX - 0.25 + 0.2, TOP + 0.28, 0.6], 'skyBlue', { glow: 'windowWarm' }),
    ];
    // floor bands in a darker cream between storeys
    for (let f = 1; f <= 4; f++) {
      const y = PAD + GROUND_H + (f - 1) * FLOOR_H; // top of floor f-1
      parts.push(kit.box([W + 0.04, 0.04, D + 0.04], [BX, y, 0], 'sand'));
    }
    // ground floor: entrance with a neon heart canopy, shop-front windows
    parts.push(
      ...door(kit, { at: [FRONT, PAD + 0.2, 0], facing: 'x+', w: 0.34, h: 0.4, color: 'teal', knob: 'sunYellow' }),
      kit.box([0.28, 0.04, 0.6], [FRONT + 0.14, PAD + 0.46, 0], 'red'),
      ...glassWindow(kit, { at: [FRONT, PAD + 0.25, -0.82], facing: 'x+', w: 0.5, h: 0.26, panes: 2 }),
      ...glassWindow(kit, { at: [FRONT, PAD + 0.25, 0.82], facing: 'x+', w: 0.5, h: 0.26, panes: 2 }),
    );
    // neon heart over the canopy: two balls and a diamond, pink
    const hx = FRONT + 0.02;
    const hy = PAD + GROUND_H - 0.03;
    parts.push(
      kit.box([0.03, 0.24, 0.24], [hx, hy, 0], 'charcoal'),
      kit.sphere(0.05, [hx + 0.03, hy + 0.04, -0.04], 'pink', { detail: 0, glow: true }),
      kit.sphere(0.05, [hx + 0.03, hy + 0.04, 0.04], 'pink', { detail: 0, glow: true }),
      kit.box([0.03, 0.08, 0.08], [hx + 0.03, hy - 0.02, 0], 'pink', { rotate: [Math.PI / 4, 0, 0], glow: true }),
    );
    // storeys 1-4: a window and a balcony per bay
    for (let f = 0; f < 4; f++) {
      const slab = PAD + GROUND_H + f * FLOOR_H + 0.04; // balcony slab top
      BAYS.forEach((z, b) => {
        parts.push(...glassWindow(kit, { at: [FRONT, slab + 0.3, z], facing: 'x+', w: 0.34, h: 0.3, panes: 1, frame: b % 2 === 0 ? 'teal' : 'blue' }));
        parts.push(...balcony(kit, slab, z, (f + b) % 2 === 1, f + b));
      });
      // side and back windows
      for (const wx of [BX - 0.3, BX + 0.3]) {
        parts.push(...glassWindow(kit, { at: [wx, slab + 0.28, D / 2], facing: 'z+', w: 0.3, h: 0.3, panes: 1 }));
        parts.push(...glassWindow(kit, { at: [wx, slab + 0.28, -D / 2], facing: 'z-', w: 0.3, h: 0.3, panes: 1 }));
      }
      parts.push(...glassWindow(kit, { at: [BX - W / 2, slab + 0.28, 0], facing: 'x-', w: 0.5, h: 0.3, panes: 2 }));
    }
    parts.push(rod(kit, [BX + 0.35, TOP + 0.08, 0.3], [BX + 0.35, TOP + 0.55, 0.3], 0.015, 'stoneDark', { segments: 4 })); // antenna
    return kit.finish(parts);
  },
};
