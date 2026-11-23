import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { gableRoof, glassWindow } from '../../../models/parts';

// A wooden Thai dessert shop (2×2, front on +x): an open counter with trays of colourful sweets
// under a striped awning, lit windows and a pink flower neon on a post.
const BASE = 0.05;
const WALL = { x: -0.4, w: 0.9, d: 1.7, top: 1.05 }; // building: x from -0.85 to 0.05
const FRONT = WALL.x + WALL.w / 2;
const RISE = 0.33;
const COUNTER = { x: 0.3, w: 0.4, d: 1.5, h: 0.32 };
const SWEETS: PaletteColor[] = ['pink', 'mint', 'sunYellow', 'lime', 'purple', 'orange', 'white', 'red'];
const SLOPE = 0.3;

/** ร้านขนมไทย: a wooden dessert shop with trays of sweets and a flower neon. */
export const item: ItemModel = {
  id: 'thai-dessert-shop',
  name: 'ร้านขนมไทย',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([WALL.w + 0.12, BASE, WALL.d + 0.1], [WALL.x, BASE / 2, 0], 'stone'),
      kit.box([WALL.w, WALL.top - BASE, WALL.d], [WALL.x, (BASE + WALL.top) / 2, 0], 'wood'),
      kit.wedge([WALL.w, RISE, WALL.d - 0.02], [WALL.x, WALL.top + RISE / 2, 0], 'wood'),
      ...gableRoof(kit, { at: [WALL.x, WALL.top, 0], length: WALL.d + 0.14, width: WALL.w, rise: RISE, eave: 0.08, color: 'terracotta', ridge: 'redDark' }),
    ];
    // corner posts and a plank band for a timber look
    for (const z of [-WALL.d / 2, WALL.d / 2]) {
      for (const x of [WALL.x - WALL.w / 2, FRONT]) parts.push(kit.box([0.08, WALL.top - BASE, 0.08], [x, (BASE + WALL.top) / 2, z], 'woodDark'));
    }
    parts.push(kit.box([WALL.w + 0.02, 0.05, WALL.d + 0.02], [WALL.x, 0.2, 0], 'woodDark'));
    // windows: two above the awning on the front, one on each other wall
    for (const z of [-0.5, 0.5]) parts.push(...glassWindow(kit, { at: [FRONT, 0.9, z], facing: 'x+', w: 0.32, h: 0.2, panes: 2 }));
    parts.push(
      ...glassWindow(kit, { at: [WALL.x, 0.62, WALL.d / 2], facing: 'z+', w: 0.4, h: 0.3, panes: 2 }),
      ...glassWindow(kit, { at: [WALL.x, 0.62, -WALL.d / 2], facing: 'z-', w: 0.4, h: 0.3, panes: 2 }),
      ...glassWindow(kit, { at: [WALL.x - WALL.w / 2, 0.62, 0], facing: 'x-', w: 0.5, h: 0.3, panes: 3 }),
    );
    // striped awning over the shop front, sloping down away from the wall
    const strips = 6;
    const stripZ = (WALL.d - 0.1) / strips;
    for (let i = 0; i < strips; i++) {
      parts.push(kit.box([0.36, 0.035, stripZ], [FRONT + 0.16, 0.66, -0.8 + stripZ * (i + 0.5)], i % 2 ? 'white' : 'pink', { rotate: [0, 0, -SLOPE] }));
    }
    parts.push(kit.box([0.04, 0.05, WALL.d - 0.1], [FRONT + 0.34, 0.6, 0], 'pink', { glow: 'pink' })); // glowing awning edge
    // counter with a pale top and a row of trays
    parts.push(
      kit.box([COUNTER.w, COUNTER.h, COUNTER.d], [COUNTER.x, COUNTER.h / 2, 0], 'woodDark'),
      kit.box([COUNTER.w + 0.04, 0.04, COUNTER.d + 0.04], [COUNTER.x, COUNTER.h + 0.02, 0], 'white'),
      kit.box([0.04, 0.2, COUNTER.d - 0.1], [COUNTER.x + COUNTER.w / 2 - 0.02, 0.16, 0], 'sunYellow'),
    );
    const trayTop = COUNTER.h + 0.04;
    for (let i = 0; i < 5; i++) {
      const z = -0.6 + i * 0.3;
      parts.push(kit.box([0.3, 0.03, 0.24], [COUNTER.x, trayTop + 0.015, z], 'brass'));
      for (let j = 0; j < 3; j++) {
        const color = SWEETS[(i * 3 + j) % SWEETS.length];
        const x = COUNTER.x - 0.09 + j * 0.09;
        if ((i + j) % 2) parts.push(kit.sphere(0.035, [x, trayTop + 0.05, z - 0.05], color, { detail: 0 }), kit.box([0.07, 0.045, 0.07], [x, trayTop + 0.0525, z + 0.05], SWEETS[(i + j * 2 + 1) % SWEETS.length]));
        else parts.push(kit.box([0.07, 0.045, 0.07], [x, trayTop + 0.0525, z - 0.05], color), kit.sphere(0.035, [x, trayTop + 0.05, z + 0.05], SWEETS[(i + j * 2 + 3) % SWEETS.length], { detail: 0 }));
      }
    }
    // pink flower neon on a round board on a post at the front corner
    const sx = 0.85;
    const sz = 0.62;
    const cy = 1.15;
    parts.push(
      kit.cylinder(0.03, 0.03, 0.9, [sx, BASE + 0.45, sz], 'charcoal', { segments: 6 }),
      kit.box([0.12, BASE, 0.12], [sx, BASE / 2, sz], 'stone'),
      kit.cylinder(0.3, 0.3, 0.05, [sx, cy, sz], 'navy', { segments: 14, rotate: [0, 0, Math.PI / 2] }),
      kit.torus(0.29, 0.035, [sx + 0.03, cy, sz], 'sunYellow', { radialSegments: 4, tubularSegments: 16, rotate: [0, Math.PI / 2, 0], glow: 'sunYellow' }),
      kit.sphere(0.07, [sx + 0.05, cy, sz], 'sunYellow', { detail: 0, glow: 'sunYellow' }),
    );
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      parts.push(kit.sphere(0.09, [sx + 0.05, cy + Math.cos(a) * 0.15, sz + Math.sin(a) * 0.15], 'pink', { detail: 0, scale: [0.5, 1, 1], glow: 'pink' }));
    }
    return kit.finish(parts);
  },
};
