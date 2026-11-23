import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { glassWindow } from '../../../models/parts';

// A newsstand kiosk (1×2, long side along z, front +x): a teal booth with a red roof, a slanted
// rack of colourful magazines (colour blocks, no text) on the counter, a glowing lamp and a blue
// neon open-book icon on a board on the ridge.
const BASE_H = 0.04;
const BODY = { x: -0.2, w: 0.5, d: 1.5, h: 0.78 };
const ROOF = { y: 0.82, rise: 0.22, w: 0.9, d: 1.7, x: -0.05 };
const COUNTER = { x0: 0.05, x1: 0.38, h: 0.22 };
const TILT = 0.25;
const RACK = { cx: 0.22, h: 0.5, d: 1.4 };
const COVERS: PaletteColor[] = ['red', 'sunYellow', 'blue', 'pink', 'leaf', 'orange', 'purple', 'mint'];

/** แผงหนังสือ: a newsstand kiosk with a magazine rack and a lamp. */
export const item: ItemModel = {
  id: 'newsstand',
  name: 'แผงหนังสือ',
  category: 'building',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const sin = Math.sin(TILT);
    const cos = Math.cos(TILT);
    const rackY = BASE_H + COUNTER.h + (RACK.h / 2) * cos;
    const parts: Part[] = [
      kit.box([0.96, BASE_H, 1.96], [0, BASE_H / 2, 0], 'stone'),
      kit.box([BODY.w, BODY.h, BODY.d], [BODY.x, BASE_H + BODY.h / 2, 0], 'teal'),
      kit.box([COUNTER.x1 - COUNTER.x0, COUNTER.h, BODY.d], [(COUNTER.x0 + COUNTER.x1) / 2, BASE_H + COUNTER.h / 2, 0], 'woodDark'),
      kit.box([ROOF.w, 0.04, ROOF.d], [ROOF.x, ROOF.y + 0.02, 0], 'white'),
      kit.wedge([ROOF.w, ROOF.rise, ROOF.d - 0.04], [ROOF.x, ROOF.y + 0.04 + ROOF.rise / 2, 0], 'red'),
      ...glassWindow(kit, { at: [BODY.x, 0.5, BODY.d / 2], facing: 'z+', w: 0.3, h: 0.3 }),
      ...glassWindow(kit, { at: [BODY.x, 0.5, -BODY.d / 2], facing: 'z-', w: 0.3, h: 0.3 }),
      ...glassWindow(kit, { at: [BODY.x - BODY.w / 2, 0.5, 0], facing: 'x-', w: 0.8, h: 0.3, panes: 3 }),
      // the slanted rack, leaning back against the booth
      kit.box([0.06, RACK.h, RACK.d], [RACK.cx, rackY, 0], 'wood', { rotate: [0, 0, TILT] }),
    ];
    // magazine covers: 3 rows × 7 columns, each a flat coloured block lying on the rack face
    let n = 0;
    for (const s of [-0.17, 0, 0.17]) {
      for (let c = 0; c < 7; c++) {
        const z = -0.57 + c * 0.19;
        const off = 0.045;
        parts.push(kit.box([0.025, 0.14, 0.15], [RACK.cx + cos * off - sin * s, rackY + sin * off + cos * s, z], COVERS[n % COVERS.length], { rotate: [0, 0, TILT] }));
        n++;
      }
    }
    // roof ridge: a navy board with a neon open book, and a lamp on a post
    const ridge = ROOF.y + 0.04 + ROOF.rise;
    for (const z of [-0.5, 0.1]) {
      parts.push(kit.cylinder(0.02, 0.02, 0.12, [ROOF.x, ridge + 0.05, z], 'charcoal', { segments: 4 }));
    }
    const bx = ROOF.x;
    const by = ridge + 0.12 + 0.15;
    parts.push(
      kit.box([0.05, 0.4, 0.9], [bx, by + 0.05, -0.2], 'navy'),
      kit.box([0.045, 0.26, 0.3], [bx + 0.045, by + 0.05, -0.37], 'blue', { glow: true, rotate: [-0.25, 0, 0] }),
      kit.box([0.045, 0.26, 0.3], [bx + 0.045, by + 0.05, -0.03], 'blue', { glow: true, rotate: [0.25, 0, 0] }),
      kit.cylinder(0.02, 0.02, 0.4, [bx, ridge + 0.2, 0.6], 'charcoal', { segments: 6 }),
      kit.sphere(0.08, [bx, ridge + 0.46, 0.6], 'lampWarm', { glow: true, light: 'breathe' }),
    );
    // bulbs along the front roof edge, in three colours
    const EDGE: PaletteColor[] = ['orange', 'pink', 'sunYellow'];
    const BULBS = 10;
    for (let i = 0; i < BULBS; i++) {
      parts.push(kit.sphere(0.04, [ROOF.x + ROOF.w / 2 - 0.02, ROOF.y - 0.01, -0.72 + (1.44 * i) / (BULBS - 1)], EDGE[i % EDGE.length], { detail: 0, glow: true, light: 'chase', chase: { index: i, count: BULBS } }));
    }
    return kit.finish(parts);
  },
};
