import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// Three storeys of glass fronts, a red canopy entrance on +x and a rooftop sign: a pink neon star on a
// dark board ringed by chase bulbs.
const BASE = { w: 1.9, h: 0.05, d: 2.9 };
const W = 0.75 * 2; // wall depth (x)
const L = 2.7; // wall length (z)
const FLOOR = 0.6;
const TOP = BASE.h + FLOOR * 3;
const SIGN = { x: 0.3, y: 2.43, w: 1.9, h: 0.6, d: 0.08 };

/** Neon stroke on a +x facing sign: a thin glowing bar from a to b, both [y, z]. */
function stroke(kit: StyleKit, x: number, a: [number, number], b: [number, number], t = 0.055): Part {
  const dy = b[0] - a[0];
  const dz = b[1] - a[1];
  return kit.box([t, Math.hypot(dy, dz) + t * 0.6, t], [x, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2], 'pink',
    { rotate: [Math.atan2(dz, dy), 0, 0], glow: 'pink' });
}

/** Points [y, z] running round a rectangle, bottom-left first, going up the right side. */
function perimeter(y0: number, y1: number, z0: number, z1: number, step: number): [number, number][] {
  const nz = Math.round((z1 - z0) / step);
  const ny = Math.round((y1 - y0) / step);
  const pts: [number, number][] = [];
  for (let i = 0; i <= nz; i++) pts.push([y0, z0 + ((z1 - z0) * i) / nz]);
  for (let j = 1; j < ny; j++) pts.push([y0 + ((y1 - y0) * j) / ny, z1]);
  for (let i = nz; i >= 0; i--) pts.push([y1, z0 + ((z1 - z0) * i) / nz]);
  for (let j = ny - 1; j >= 1; j--) pts.push([y0 + ((y1 - y0) * j) / ny, z0]);
  return pts;
}

/** ห้างสรรพสินค้า: a three-storey store with glass fronts, a canopy entrance and a neon rooftop sign. */
export const item: ItemModel = {
  id: 'department-store',
  name: 'ห้างสรรพสินค้า',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.d], [0, BASE.h / 2, 0], 'stone'),
      kit.box([W, FLOOR * 3, L], [0, BASE.h + (FLOOR * 3) / 2, 0], 'cream'),
      // floor bands and the roof edge
      kit.box([W + 0.06, 0.05, L + 0.06], [0, BASE.h + FLOOR, 0], 'white'),
      kit.box([W + 0.06, 0.05, L + 0.06], [0, BASE.h + FLOOR * 2, 0], 'white'),
      kit.box([W + 0.1, 0.08, L + 0.1], [0, TOP + 0.02, 0], 'white'),
      // coloured fins at the front corners
      kit.box([0.05, FLOOR * 3, 0.1], [W / 2 + 0.01, BASE.h + (FLOOR * 3) / 2, 1.3], 'purple'),
      kit.box([0.05, FLOOR * 3, 0.1], [W / 2 + 0.01, BASE.h + (FLOOR * 3) / 2, -1.3], 'purple'),
    ];
    // glass fronts on +x: shop windows and a door below, three windows a floor above
    parts.push(
      ...door(kit, { at: [W / 2, BASE.h + 0.21, 0], facing: 'x+', w: 0.5, h: 0.42, color: 'navy', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [W / 2, 0.36, 0.95], facing: 'x+', w: 0.6, h: 0.3 }),
      ...glassWindow(kit, { at: [W / 2, 0.36, -0.95], facing: 'x+', w: 0.6, h: 0.3 }),
    );
    for (const k of [1, 2]) {
      for (const z of [-0.9, 0, 0.9]) {
        parts.push(...glassWindow(kit, { at: [W / 2, BASE.h + FLOOR * k + 0.3, z], facing: 'x+', w: 0.7, h: 0.34, panes: 3 }));
      }
    }
    // the other three sides: two windows a floor
    for (let k = 0; k < 3; k++) {
      const y = BASE.h + FLOOR * k + 0.3;
      for (const s of [-1, 1]) {
        parts.push(
          ...glassWindow(kit, { at: [s * 0.36, y, L / 2], facing: 'z+', w: 0.46, h: 0.34 }),
          ...glassWindow(kit, { at: [s * 0.36, y, -L / 2], facing: 'z-', w: 0.46, h: 0.34 }),
          ...glassWindow(kit, { at: [-W / 2, y, s * 0.7], facing: 'x-', w: 0.7, h: 0.34 }),
        );
      }
    }
    // canopy entrance
    parts.push(
      kit.box([0.24, 0.05, 1.6], [W / 2 + 0.12, 0.58, 0], 'red'),
      kit.box([0.03, 0.09, 1.6], [W / 2 + 0.235, 0.57, 0], 'white'),
      kit.cylinder(0.03, 0.03, 0.53, [W / 2 + 0.2, BASE.h + 0.265, 0.7], 'white', { segments: 6 }),
      kit.cylinder(0.03, 0.03, 0.53, [W / 2 + 0.2, BASE.h + 0.265, -0.7], 'white', { segments: 6 }),
    );
    // rooftop sign
    for (const z of [-0.75, 0.75]) {
      parts.push(kit.cylinder(0.03, 0.03, SIGN.y - SIGN.h / 2 - TOP - 0.02, [SIGN.x, (TOP + 0.06 + SIGN.y - SIGN.h / 2) / 2, z], 'charcoal', { segments: 6 }));
    }
    parts.push(kit.box([SIGN.d, SIGN.h, SIGN.w], [SIGN.x, SIGN.y, 0], 'navy'));
    const faceX = SIGN.x + SIGN.d / 2 + 0.02;
    // pink neon star (a pentagram of five strokes)
    const R = 0.22;
    const v = (i: number): [number, number] => {
      const a = Math.PI / 2 + (i * 2 * Math.PI) / 5;
      return [SIGN.y + R * Math.sin(a), R * Math.cos(a)];
    };
    for (let i = 0; i < 5; i++) parts.push(stroke(kit, faceX, v(i), v((i + 2) % 5)));
    // pink light strip along the roof edge
    parts.push(kit.box([0.03, 0.03, L + 0.04], [W / 2 + 0.06, TOP + 0.02, 0], 'pink', { glow: 'pink' }));
    // chase bulbs round the board
    const ring = perimeter(SIGN.y - 0.27, SIGN.y + 0.27, -0.88, 0.88, 0.22);
    ring.forEach(([y, z], index) => {
      parts.push(kit.sphere(0.04, [faceX + 0.01, y, z], 'lampWarm', { detail: 0, glow: true, light: 'chase', chase: { index, count: ring.length } }));
    });
    return kit.finish(parts);
  },
};
