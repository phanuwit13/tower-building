import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, rod } from '../../../models/parts';

// A long glass-house on a stone plinth (2×3, long side along z): arched teal ribs with the plants showing
// between them, lit glass walls at the sides and ends. The glass and the grow-lights glow soft warm/green at night.
const PLINTH = { w: 1.9, h: 0.12, d: 2.9 };
const FLOOR = PLINTH.h;
const R = 0.8; // half width of the arches
const RISE = 1.1; // arch height scale (top at FLOOR + R * RISE)
const RIB_Z = [-1.2, -0.6, 0, 0.6, 1.2];
const WALL_H = 0.32;

/** โดมปลูกผัก: a glass greenhouse full of plants, lit at night. */
export const item: ItemModel = {
  id: 'greenhouse-dome',
  name: 'โดมปลูกผัก',
  category: 'nature',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const top = FLOOR + R * RISE;
    const parts: Part[] = [kit.box([PLINTH.w, PLINTH.h, PLINTH.d], [0, PLINTH.h / 2, 0], 'stone')];
    // arch ribs
    for (const z of RIB_Z) {
      parts.push(kit.torus(R, 0.035, [0, FLOOR, z], 'teal', { arc: Math.PI, radialSegments: 4, tubularSegments: 8, scale: [1, RISE, 1] }));
    }
    // ridge and two purlins along z
    const pz = 1.3;
    parts.push(rod(kit, [0, top, -pz], [0, top, pz], 0.035, 'white', { segments: 6 }));
    for (const s of [-1, 1]) {
      const px = s * R * Math.cos(Math.PI / 4);
      const py = FLOOR + R * RISE * Math.sin(Math.PI / 4);
      parts.push(rod(kit, [px, py, -pz], [px, py, pz], 0.025, 'teal', { segments: 4 }));
    }
    // lit glass walls: both sides and both ends
    for (const s of [-1, 1]) {
      parts.push(kit.box([0.02, WALL_H, 2.6], [s * R, FLOOR + WALL_H / 2, 0], 'mint'));
      parts.push(kit.box([R * 2 - 0.04, WALL_H, 0.02], [0, FLOOR + WALL_H / 2, s * 1.3], 'mint'));
      // a few small lit panes (deep green glow) on each side wall
      for (const z of [-0.8, 0, 0.8]) {
        parts.push(kit.box([0.02, 0.16, 0.4], [s * (R + 0.012), FLOOR + 0.18, z + (s > 0 ? 0.0 : 0)], 'leaf', { glow: 'leaf', light: 'window' }));
      }
      parts.push(kit.box([0.04, 0.04, 2.64], [s * R, FLOOR + WALL_H + 0.02, 0], 'teal'));
    }
    parts.push(...door(kit, { at: [R + 0.01, FLOOR + 0.25, 0.4], facing: 'x+', w: 0.3, h: 0.5, color: 'orange', knob: 'sunYellow' }));
    // two long beds with plants
    for (const s of [-1, 1]) {
      parts.push(kit.box([0.4, 0.1, 2.3], [s * 0.38, FLOOR + 0.05, 0], 'woodDark'));
      parts.push(kit.box([0.34, 0.02, 2.24], [s * 0.38, FLOOR + 0.1, 0], 'bark'));
    }
    const plants: Array<[number, number, number, 'leaf' | 'lime' | 'leafDark']> = [
      [0.38, -0.95, 0.13, 'leaf'], [0.38, -0.5, 0.16, 'lime'], [0.4, -0.05, 0.14, 'leafDark'], [0.38, 0.45, 0.17, 'leaf'], [0.38, 0.95, 0.13, 'lime'],
      [-0.38, -0.95, 0.15, 'lime'], [-0.38, -0.45, 0.13, 'leaf'], [-0.38, 0.05, 0.17, 'leafDark'], [-0.38, 0.5, 0.14, 'lime'], [-0.38, 0.95, 0.16, 'leaf'],
    ];
    for (const [x, z, r, c] of plants) {
      parts.push(kit.sphere(r, [x, FLOOR + 0.12 + r * 0.9, z], c, { detail: 0, scale: [1, 1.1, 1] }));
    }
    // fruit and flower bulbs on top of the plants (these glow a little at night)
    const bulbs: Array<[number, number, number, 'red' | 'sunYellow' | 'pink' | 'orange']> = [
      [0.42, -0.5, 0.5, 'red'], [0.34, 0.45, 0.55, 'sunYellow'], [0.4, -0.95, 0.42, 'pink'], [0.36, 0.95, 0.4, 'orange'],
      [-0.4, -0.45, 0.4, 'pink'], [-0.34, 0.05, 0.58, 'sunYellow'], [-0.4, 0.5, 0.46, 'red'], [-0.36, 0.95, 0.52, 'orange'],
    ];
    for (const [x, z, y, c] of bulbs) {
      parts.push(kit.sphere(0.055, [x, FLOOR + y, z], c, { detail: 0, glow: true, light: 'window' }));
    }
    // a tall leafy plant down the middle aisle and a green grow-light strip
    parts.push(kit.cone(0.14, 0.7, [0, FLOOR + 0.35, -0.9], 'leaf', { segments: 6 }));
    parts.push(kit.cone(0.12, 0.55, [0, FLOOR + 0.28, 0.9], 'lime', { segments: 6 }));
    parts.push(kit.box([0.06, 0.02, 1.6], [0, FLOOR + 0.01 + 0.02, 0], 'leaf', { glow: 'leaf', light: 'window' }));
    return kit.finish(parts);
  },
};
