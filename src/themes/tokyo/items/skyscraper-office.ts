import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { glassWindow } from '../../../models/parts';

// A stepped glass tower (2×3): podium, three tiers with bands of glass that glow at night, a rooftop helipad
// (a yellow ring, no letters) and a red blinking mast light. Top of the tower about 4.5.
const PODIUM = { w: 1.9, h: 0.5, d: 2.9 };
const FLOOR = 0.4; // one storey: a 0.2 glass band plus a 0.2 spandrel
const GLASS = 0.14;

interface Tier {
  w: number; // x
  d: number; // z
  y0: number;
  y1: number;
  color: PaletteColor;
  segs: number; // glass segments along the long side (each pane glows a little differently)
}
const TIERS: Tier[] = [
  { w: 1.5, d: 2.4, y0: PODIUM.h, y1: 2.5, color: 'white', segs: 3 },
  { w: 1.2, d: 1.8, y0: 2.5, y1: 3.7, color: 'stone', segs: 2 },
  { w: 0.8, d: 1.1, y0: 3.7, y1: 4.2, color: 'white', segs: 2 },
];

function glassBox(kit: StyleKit, size: [number, number, number], at: [number, number, number]): Part {
  return kit.box(size, at, 'skyBlue', { glow: 'windowWarm', light: 'window' });
}

function tower(kit: StyleKit, t: Tier): Part[] {
  const h = t.y1 - t.y0;
  const parts: Part[] = [
    kit.box([t.w, h, t.d], [0, t.y0 + h / 2, 0], t.color),
    kit.box([t.w + 0.08, 0.05, t.d + 0.08], [0, t.y1 + 0.025, 0], 'charcoal'),
  ];
  const floors = Math.max(1, Math.round(h / FLOOR));
  const step = h / floors;
  for (let f = 0; f < floors; f++) {
    const y = t.y0 + step * f + step / 2;
    const gh = Math.min(GLASS, step - 0.08);
    for (let s = 0; s < t.segs; s++) {
      const len = (t.d - 0.16) / t.segs;
      const z = -t.d / 2 + 0.08 + len * (s + 0.5);
      const gap = 0.04;
      for (const sx of [-1, 1]) parts.push(glassBox(kit, [0.04, gh, len - gap - 0.06], [sx * (t.w / 2 + 0.01), y, z]));
    }
    const n = 2; // panes along x on the short sides
    for (let s = 0; s < n; s++) {
      const len = (t.w - 0.16) / n;
      const x = -t.w / 2 + 0.08 + len * (s + 0.5);
      for (const sz of [-1, 1]) parts.push(glassBox(kit, [len - 0.1, gh, 0.04], [x, y, sz * (t.d / 2 + 0.01)]));
    }
  }
  return parts;
}

/** ตึกสำนักงานระฟ้า: the tallest building of the city. */
export const item: ItemModel = {
  id: 'skyscraper-office',
  name: 'ตึกสำนักงานระฟ้า',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([PODIUM.w, PODIUM.h, PODIUM.d], [0, PODIUM.h / 2, 0], 'stone')];
    // a lit lobby on the podium: glass shopfronts on +x, one window on the other sides
    for (const z of [-0.9, 0, 0.9]) {
      parts.push(...glassWindow(kit, { at: [PODIUM.w / 2, 0.28, z], facing: 'x+', w: 0.62, h: 0.3, panes: 3 }));
    }
    parts.push(
      kit.box([PODIUM.w + 0.06, 0.05, PODIUM.d + 0.06], [0, PODIUM.h - 0.02, 0], 'white'),
      ...glassWindow(kit, { at: [-PODIUM.w / 2, 0.28, 0], facing: 'x-', w: 1.2, h: 0.3, panes: 3 }),
      ...glassWindow(kit, { at: [0, 0.28, PODIUM.d / 2], facing: 'z+', w: 1.0, h: 0.3, panes: 3 }),
      ...glassWindow(kit, { at: [0, 0.28, -PODIUM.d / 2], facing: 'z-', w: 1.0, h: 0.3, panes: 3 }),
    );
    for (const t of TIERS) parts.push(...tower(kit, t));
    // helipad: a dark disc with a yellow ring, then a mast with a blinking red light
    const top = TIERS[2].y1 + 0.05;
    parts.push(
      kit.cylinder(0.32, 0.32, 0.04, [0, top + 0.02, 0], 'charcoal', { segments: 12 }),
      kit.torus(0.22, 0.02, [0, top + 0.05, 0], 'sunYellow', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.02, 0.02, 0.26, [-0.25, top + 0.17, -0.3], 'stoneDark', { segments: 6 }),
      kit.sphere(0.04, [-0.25, top + 0.33, -0.3], 'red', { detail: 0, glow: 'red', light: 'blink' }),
    );
    return kit.finish(parts);
  },
};
