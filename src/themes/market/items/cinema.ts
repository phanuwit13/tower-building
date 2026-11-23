import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, glassWindow } from '../../../models/parts';

// A cinema (2×3, long side along z, front +x): a blue block with a taller auditorium at the back,
// a red marquee over the door ringed with chase bulbs, poster frames (colour pictures, no text)
// and a rooftop board with a pink neon film reel.
const BODY = { x0: -0.95, x1: 0.4, z: 1.4, top: 1.6 };
const BASE_H = 0.04;
const MARQUEE = { x0: 0.4, x1: 0.97, y: 0.8, halfZ: 0.85, fasciaH: 0.4 };
const BULBS_Z = 11; // per long edge
const BULBS_Y = 3; // per short edge (corners shared)
const BOARD = { x: 0.12, y: 2.15, w: 1.0, h: 0.9, d: 0.08 };
const POSTERS: Array<{ z: number; bg: PaletteColor; fg: PaletteColor; shape: 'ball' | 'bar' }> = [
  { z: -1.28, bg: 'sunYellow', fg: 'red', shape: 'ball' },
  { z: -1.02, bg: 'mint', fg: 'purple', shape: 'bar' },
  { z: 1.02, bg: 'pink', fg: 'navy', shape: 'ball' },
  { z: 1.28, bg: 'orange', fg: 'white', shape: 'bar' },
];

/** โรงหนัง: a cinema with a chase-light marquee, poster frames and a film-reel neon. */
export const item: ItemModel = {
  id: 'cinema',
  name: 'โรงหนัง',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const wallW = BODY.x1 - BODY.x0;
    const cx = (BODY.x0 + BODY.x1) / 2;
    const parts: Part[] = [
      kit.box([wallW + 0.08, BASE_H, BODY.z * 2 + 0.08], [cx, BASE_H / 2, 0], 'stone'),
      kit.box([wallW, BODY.top - BASE_H, BODY.z * 2], [cx, (BASE_H + BODY.top) / 2, 0], 'blue'),
      kit.box([wallW + 0.08, 0.08, BODY.z * 2 + 0.08], [cx, BODY.top + 0.04, 0], 'navy'),
      // the auditorium: a taller block at the back
      kit.box([0.6, 0.5, 2.4], [-0.65, BODY.top + 0.08 + 0.25, 0], 'navy'),
      kit.box([0.02, 0.06, 2.0], [-0.34, BODY.top + 0.4, 0], 'purple'),
      // marquee: a red slab, a purple fascia and a ring of chase bulbs round the fascia
      kit.box([MARQUEE.x1 - MARQUEE.x0, 0.06, MARQUEE.halfZ * 2], [(MARQUEE.x0 + MARQUEE.x1) / 2, MARQUEE.y, 0], 'red'),
      kit.box([0.05, MARQUEE.fasciaH, MARQUEE.halfZ * 2], [MARQUEE.x1 - 0.05, MARQUEE.y + 0.03 + MARQUEE.fasciaH / 2 - 0.02, 0], 'purple'),
      ...door(kit, { at: [BODY.x1, BASE_H + 0.23, -0.14], facing: 'x+', w: 0.24, h: 0.46, color: 'woodDark', knob: 'sunYellow' }),
      ...door(kit, { at: [BODY.x1, BASE_H + 0.23, 0.14], facing: 'x+', w: 0.24, h: 0.46, color: 'woodDark' }),
      // upper windows over the marquee, and windows round the other walls
      ...glassWindow(kit, { at: [BODY.x1, 1.42, -0.5], facing: 'x+', w: 0.5, h: 0.2 }),
      ...glassWindow(kit, { at: [BODY.x1, 1.42, 0.5], facing: 'x+', w: 0.5, h: 0.2 }),
      ...glassWindow(kit, { at: [-0.5, 0.85, BODY.z], facing: 'z+', w: 0.3, h: 0.3 }),
      ...glassWindow(kit, { at: [0, 0.85, BODY.z], facing: 'z+', w: 0.3, h: 0.3 }),
      ...glassWindow(kit, { at: [-0.5, 0.85, -BODY.z], facing: 'z-', w: 0.3, h: 0.3 }),
      ...glassWindow(kit, { at: [0, 0.85, -BODY.z], facing: 'z-', w: 0.3, h: 0.3 }),
      ...glassWindow(kit, { at: [BODY.x0, 0.9, -0.5], facing: 'x-', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [BODY.x0, 0.9, 0.5], facing: 'x-', w: 0.5, h: 0.3 }),
    ];
    // coloured light strips along the facade: roof edge (purple) and foot (teal)
    parts.push(
      kit.box([0.03, 0.06, BODY.z * 2 - 0.1], [BODY.x1 + 0.03, BODY.top - 0.06, 0], 'purple', { glow: true }),
      kit.box([0.03, 0.05, BODY.z * 2 - 0.1], [BODY.x1 + 0.03, BASE_H + 0.1, 0], 'teal', { glow: true }),
    );
    // chase run round the fascia rectangle (front face), travelling around once
    const fy0 = MARQUEE.y + 0.01;
    const fy1 = MARQUEE.y + 0.03 + MARQUEE.fasciaH - 0.02;
    const bx = MARQUEE.x1 + 0.0;
    const path: Array<[number, number]> = [];
    const w = MARQUEE.halfZ * 2;
    for (let i = 0; i < BULBS_Z; i++) path.push([-MARQUEE.halfZ + 0.02 + ((w - 0.04) * i) / BULBS_Z, fy0]);
    for (let i = 0; i < BULBS_Y; i++) path.push([MARQUEE.halfZ - 0.02, fy0 + ((fy1 - fy0) * i) / BULBS_Y]);
    for (let i = 0; i < BULBS_Z; i++) path.push([MARQUEE.halfZ - 0.02 - ((w - 0.04) * i) / BULBS_Z, fy1]);
    for (let i = 0; i < BULBS_Y; i++) path.push([-MARQUEE.halfZ + 0.02, fy1 - ((fy1 - fy0) * i) / BULBS_Y]);
    path.forEach(([z, y], index) => {
      parts.push(kit.sphere(0.03, [bx, y, z], 'lampWarm', { detail: 0, glow: true, light: 'chase', chase: { index, count: path.length } }));
    });
    // poster frames either side of the door
    for (const p of POSTERS) {
      parts.push(
        kit.box([0.03, 0.56, 0.24], [BODY.x1 + 0.015, 0.58, p.z], 'white'),
        kit.box([0.02, 0.5, 0.18], [BODY.x1 + 0.035, 0.58, p.z], p.bg),
      );
      if (p.shape === 'ball') parts.push(kit.sphere(0.06, [BODY.x1 + 0.045, 0.62, p.z], p.fg, { detail: 0, scale: [0.3, 1, 1] }));
      else parts.push(kit.box([0.02, 0.2, 0.05], [BODY.x1 + 0.05, 0.62, p.z], p.fg));
      parts.push(kit.box([0.02, 0.05, 0.14], [BODY.x1 + 0.045, 0.43, p.z], 'red'));
    }
    // rooftop board with a neon film reel
    const roofTop = BODY.top + 0.08;
    const bottom = BOARD.y - BOARD.h / 2;
    for (const z of [-0.35, 0.35]) {
      parts.push(kit.cylinder(0.04, 0.04, bottom - roofTop + 0.06, [BOARD.x, (roofTop + bottom) / 2 - 0.03, z], 'charcoal', { segments: 6 }));
    }
    const nx = BOARD.x + BOARD.d / 2 + 0.025;
    parts.push(
      kit.box([BOARD.d, BOARD.h, BOARD.w], [BOARD.x, BOARD.y, 0], 'navy'),
      kit.torus(0.32, 0.03, [nx, BOARD.y, 0], 'pink', { radialSegments: 4, tubularSegments: 16, rotate: [0, Math.PI / 2, 0], glow: true }),
      kit.sphere(0.05, [nx, BOARD.y, 0], 'pink', { detail: 0, scale: [0.4, 1, 1], glow: true }),
    );
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
      parts.push(kit.sphere(0.06, [nx, BOARD.y + Math.sin(a) * 0.17, Math.cos(a) * 0.17], 'pink', { detail: 0, scale: [0.4, 1, 1], glow: true }));
    }
    return kit.finish(parts);
  },
};
