import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, glassWindow } from '../../../models/parts';

// A small bright corner store: a wide glass front, a striped colour band (pink, yellow, purple: no brand)
// round the top, a shelf of goods outside and a teal neon cup sign on a pole.
const PAD = 0.03;
const BX = -0.2;
const W = 1.2; // along x
const L = 1.7; // along z
const FRONT = BX + W / 2; // 0.4
const WALL_TOP = 1.0;
const BAND_Y = 0.88;
const STRIPES: PaletteColor[] = ['pink', 'sunYellow', 'purple'];

/** ร้านสะดวกซื้อ: a konbini with a striped band, lit shelves and a cup sign (no brand). */
export const item: ItemModel = {
  id: 'konbini',
  name: 'ร้านสะดวกซื้อ',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.9, PAD, 1.9], [0, PAD / 2, 0], 'stone'),
      kit.box([W, WALL_TOP - PAD, L], [BX, (PAD + WALL_TOP) / 2, 0], 'white'),
      kit.box([W + 0.1, 0.07, L + 0.1], [BX, WALL_TOP + 0.035, 0], 'teal'),
      kit.box([W - 0.1, 0.03, L - 0.1], [BX, WALL_TOP + 0.085, 0], 'sunYellow'), // coloured roof top
      kit.box([0.5, 0.2, 0.4], [BX - 0.25, WALL_TOP + 0.19, -0.5], 'white'), // air-con unit on the roof
      kit.cylinder(0.12, 0.12, 0.03, [BX - 0.25, WALL_TOP + 0.3, -0.5], 'stoneDark', { segments: 8 }),
      kit.box([0.5, 0.05, 0.4], [BX - 0.25, WALL_TOP + 0.1, -0.5], 'chrome'),
    ];
    // striped colour band round the top, in 0.2 wide segments
    const n = Math.round(L / 0.2);
    for (let i = 0; i < n; i++) {
      const c = STRIPES[i % 3];
      parts.push(kit.box([W + 0.04, 0.14, L / n], [BX, BAND_Y, -L / 2 + (i + 0.5) * (L / n)], c, { glow: c }));
    }
    const m = Math.round(W / 0.2);
    for (let i = 0; i < m; i++) {
      const c = STRIPES[(i + 1) % 3];
      for (const s of [1, -1]) parts.push(kit.box([W / m, 0.14, 0.04], [BX - W / 2 + (i + 0.5) * (W / m), BAND_Y, s * (L / 2 + 0.02)], c));
    }
    // front: a long glass front (3 panes) and a sliding door, with a ledge
    parts.push(
      ...glassWindow(kit, { at: [FRONT, 0.47, -0.3], facing: 'x+', w: 1.1, h: 0.58, panes: 4, frame: 'stoneDark' }),
      ...door(kit, { at: [FRONT, 0.28, 0.55], facing: 'x+', w: 0.34, h: 0.5, color: 'skyBlue' }),
      kit.box([0.04, 0.04, 1.3], [FRONT + 0.02, 0.14, -0.3], 'stoneDark'),
    );
    // goods on three lit shelves, seen through the glass
    const goods: PaletteColor[] = ['red', 'sunYellow', 'lime', 'orange', 'pink', 'purple', 'blue'];
    for (let r = 0; r < 3; r++) {
      parts.push(kit.box([0.07, 0.025, 1.08], [FRONT + 0.05, 0.28 + r * 0.17, -0.3], 'lampWarm', { glow: true })); // shelf light strip
      for (let i = 0; i < 7; i++) parts.push(kit.box([0.07, 0.1, 0.11], [FRONT + 0.06, 0.34 + r * 0.17, -0.77 + i * 0.157], goods[(i + r * 2) % goods.length]));
    }
    // sides
    parts.push(
      ...glassWindow(kit, { at: [BX, 0.55, L / 2], facing: 'z+', w: 0.7, h: 0.4, panes: 3 }),
      ...glassWindow(kit, { at: [BX, 0.55, -L / 2], facing: 'z-', w: 0.7, h: 0.4, panes: 3 }),
      ...glassWindow(kit, { at: [BX - W / 2, 0.55, 0], facing: 'x-', w: 0.8, h: 0.4, panes: 3 }),
    );
    // outside: a crate stand of drinks (round cans in colours) beside the door
    parts.push(kit.box([0.2, 0.3, 0.3], [FRONT + 0.14, PAD + 0.15, 0.2], 'wood'));
    ['red', 'skyBlue', 'lime'].forEach((c, i) => parts.push(kit.cylinder(0.04, 0.04, 0.1, [FRONT + 0.14, PAD + 0.35, 0.1 + i * 0.1], c as PaletteColor, { segments: 6 })));
    // neon cup sign on a pole at the front corner
    const px = FRONT + 0.3;
    const pz = -0.7;
    parts.push(
      kit.cylinder(0.025, 0.03, 1.05, [px, PAD + 0.525, pz], 'charcoal', { segments: 6 }),
      kit.box([0.05, 0.4, 0.4], [px, PAD + 1.05, pz], 'charcoal'),
      kit.cylinder(0.12, 0.08, 0.2, [px + 0.04, PAD + 1.05, pz], 'teal', { segments: 8, glow: true }),
      kit.torus(0.05, 0.015, [px + 0.04, PAD + 1.05, pz + 0.13], 'teal', { radialSegments: 4, tubularSegments: 8, glow: true, rotate: [0, Math.PI / 2, 0] }),
      kit.cylinder(0.13, 0.13, 0.025, [px + 0.04, PAD + 1.17, pz], 'white', { segments: 8 }),
    );
    // neon rice-ball sign on the roof: a lime triangle (stacked bars) with a dark wrap, on a board
    // tilted back about 30 degrees so it faces up towards the camera
    const T = 0.5;
    const ox = FRONT - 0.2;
    const oy = WALL_TOP + 0.55;
    const oz = 0.25;
    const at = (u: number, v: number, d: number): [number, number, number] => [ox + d * Math.cos(T) - v * Math.sin(T), oy + v * Math.cos(T) + d * Math.sin(T), oz + u];
    const sbox = (w: number, h: number, d: number, u: number, v: number, dd: number, c: PaletteColor, glow = false): Part =>
      kit.box([d, h, w], at(u, v, dd), c, { rotate: [0, 0, T], ...(glow ? { glow: true } : {}) });
    parts.push(
      sbox(0.95, 0.85, 0.05, 0, 0, 0, 'charcoal'),
      kit.box([0.04, 0.35, 0.04], [ox + 0.1, WALL_TOP + 0.2, oz - 0.3], 'charcoal'),
      kit.box([0.04, 0.35, 0.04], [ox + 0.1, WALL_TOP + 0.2, oz + 0.3], 'charcoal'),
    );
    for (let k = 0; k < 5; k++) parts.push(sbox(0.72 - k * 0.15, 0.12, 0.04, 0, -0.26 + k * 0.12, 0.045, 'lime', true));
    parts.push(sbox(0.3, 0.14, 0.03, 0, -0.3, 0.07, 'navy'));
    return kit.finish(parts);
  },
};
