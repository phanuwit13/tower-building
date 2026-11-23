import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, glassWindow } from '../../../models/parts';

// A four-storey store (2×3): a lit glass front, a giant screen of colour blocks (no words, no picture text),
// two neon icon signs (a heart and a star) on dark boards and chase bulbs along the roof edge.
const BASE_H = 0.05;
const FLOOR = 0.5;
const W = 1.6; // depth (x)
const L = 2.7; // length (z)
const TOP = BASE_H + FLOOR * 4;
const FACE = W / 2;
const SCREEN = { y: 1.62, w: 1.7, h: 0.82 };
const BLOCKS: PaletteColor[][] = [
  ['pink', 'sunYellow', 'skyBlue', 'lime'],
  ['purple', 'orange', 'teal', 'red'],
];

/** A thin neon bar on a +x face from a to b, both [y, z]. */
function stroke(kit: StyleKit, x: number, a: [number, number], b: [number, number], color: PaletteColor, t = 0.05): Part {
  const dy = b[0] - a[0];
  const dz = b[1] - a[1];
  return kit.box([t, Math.hypot(dy, dz) + t * 0.6, t], [x, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2], color,
    { rotate: [Math.atan2(dz, dy), 0, 0], glow: color });
}

/** A closed outline through points [y, z]. */
function outline(kit: StyleKit, x: number, pts: [number, number][], color: PaletteColor): Part[] {
  return pts.map((p, i) => stroke(kit, x, p, pts[(i + 1) % pts.length], color));
}

function heart(cy: number, cz: number, r: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * Math.PI * 2;
    const hx = 16 * Math.sin(t) ** 3;
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    out.push([cy + (hy / 17) * r, cz - (hx / 17) * r]);
  }
  return out;
}

function star(cy: number, cz: number, r: number): [number, number][] {
  const v = (i: number): [number, number] => {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [cy + r * Math.sin(a), cz + r * Math.cos(a)];
  };
  return [v(0), v(2), v(4), v(1), v(3)];
}

/** ห้างสรรพสินค้า: a glass-fronted store with a giant colour screen and neon icons. */
export const item: ItemModel = {
  id: 'department-store',
  name: 'ห้างสรรพสินค้า',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.9, BASE_H, 2.9], [0, BASE_H / 2, 0], 'stone'),
      kit.box([W, FLOOR * 4, L], [0, BASE_H + FLOOR * 2, 0], 'cream'),
      kit.box([W + 0.06, 0.05, L + 0.06], [0, BASE_H + FLOOR, 0], 'white'),
      kit.box([W + 0.06, 0.05, L + 0.06], [0, BASE_H + FLOOR * 2, 0], 'white'),
      kit.box([W + 0.1, 0.1, L + 0.1], [0, TOP + 0.03, 0], 'charcoal'),
      // rooftop plant room
      kit.box([0.5, 0.2, 0.9], [-0.3, TOP + 0.18, -0.6], 'stone'),
      kit.cylinder(0.14, 0.14, 0.16, [-0.3, TOP + 0.16, 0.7], 'stoneDark', { segments: 8 }),
    ];
    // ground floor: a navy door and two shop windows under a red canopy
    parts.push(
      ...door(kit, { at: [FACE, BASE_H + 0.21, 0], facing: 'x+', w: 0.5, h: 0.42, color: 'navy', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [FACE, 0.3, 0.9], facing: 'x+', w: 0.65, h: 0.28, panes: 3 }),
      ...glassWindow(kit, { at: [FACE, 0.3, -0.9], facing: 'x+', w: 0.65, h: 0.28, panes: 3 }),
      kit.box([0.2, 0.05, 1.8], [FACE + 0.1, 0.5, 0], 'red'),
      kit.cylinder(0.03, 0.03, 0.45, [FACE + 0.17, BASE_H + 0.225, 0.8], 'white', { segments: 6 }),
      kit.cylinder(0.03, 0.03, 0.45, [FACE + 0.17, BASE_H + 0.225, -0.8], 'white', { segments: 6 }),
    );
    // second floor: a row of windows; the other sides get two windows a floor
    for (const z of [-0.9, 0, 0.9]) parts.push(...glassWindow(kit, { at: [FACE, BASE_H + FLOOR + 0.27, z], facing: 'x+', w: 0.7, h: 0.3, panes: 3 }));
    for (let k = 0; k < 4; k++) {
      const y = BASE_H + FLOOR * k + 0.27;
      for (const s of [-1, 1]) {
        parts.push(
          ...glassWindow(kit, { at: [s * 0.35, y, L / 2], facing: 'z+', w: 0.4, h: 0.3 }),
          ...glassWindow(kit, { at: [s * 0.35, y, -L / 2], facing: 'z-', w: 0.4, h: 0.3 }),
          ...glassWindow(kit, { at: [-FACE, y, s * 0.7], facing: 'x-', w: 0.7, h: 0.3 }),
        );
      }
    }
    // the giant screen: a dark frame and a grid of glowing colour blocks
    const bw = (SCREEN.w - 0.1) / 4;
    const bh = (SCREEN.h - 0.1) / 2;
    parts.push(kit.box([0.08, SCREEN.h, SCREEN.w], [FACE + 0.04, SCREEN.y, 0], 'charcoal'));
    BLOCKS.forEach((row, r) => row.forEach((c, i) => {
      parts.push(kit.box([0.03, bh - 0.03, bw - 0.03], [FACE + 0.095, SCREEN.y + (r === 0 ? 1 : -1) * (bh / 2), -SCREEN.w / 2 + 0.05 + bw * (i + 0.5)], c, { glow: c }));
    }));
    // two side boards with neon icons: a pink heart and an orange star
    const SIDE = { z: 1.1, w: 0.46, h: 0.82 };
    for (const [sz, icon, color] of [[1, heart(SCREEN.y, 0, 0.14), 'pink'], [-1, star(SCREEN.y, 0, 0.16), 'orange']] as const) {
      const z = sz * SIDE.z;
      parts.push(kit.box([0.08, SIDE.h, SIDE.w], [FACE + 0.04, SCREEN.y, z], 'navy'));
      parts.push(...outline(kit, FACE + 0.09, icon.map(([y, zz]): [number, number] => [y, zz + z]), color));
    }
    // chase bulbs along the front roof edge
    const N = 13;
    for (let i = 0; i < N; i++) {
      parts.push(kit.sphere(0.04, [FACE + 0.07, TOP + 0.1, -1.2 + (2.4 * i) / (N - 1)], 'lampWarm', { detail: 0, glow: true, light: 'chase', chase: { index: i, count: N } }));
    }
    return kit.finish(parts);
  },
};
