import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, glassWindow, rod, wallPanel } from '../../../models/parts';

// A big electronics store (2×3, front on +x): a wall of glowing TV screens in the front window,
// a rooftop sign with a sky-blue lightning-bolt neon and chase bulbs round its edge.
const W = 1.7; // wall width (x)
const L = 2.8; // wall length (z)
const BASE = 0.05;
const H = 1.05; // wall top
const FRONT = W / 2;
const TV = { cols: 5, rows: 3, w: 0.36, h: 0.22, pitchZ: 0.4, pitchY: 0.26, z: -0.275, y: 0.59 };
const SCREEN_COLORS: PaletteColor[] = ['skyBlue', 'pink', 'lime', 'sunYellow', 'purple', 'teal', 'orange', 'blue'];
const SIGN = { x: 0.5, y: 1.5, halfZ: 1.0, halfY: 0.275, bulbs: 28 };

/** Evenly spaced points round a rectangle in the y–z plane, starting at the top-left corner. */
function rectPoints(cy: number, cz: number, hy: number, hz: number, n: number): [number, number][] {
  const per = 4 * (hy + hz);
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    let s = (i / n) * per;
    const top = 2 * hz;
    const side = 2 * hy;
    if (s < top) pts.push([cy + hy, cz - hz + s]);
    else if ((s -= top) < side) pts.push([cy + hy - s, cz + hz]);
    else if ((s -= side) < top) pts.push([cy - hy, cz + hz - s]);
    else pts.push([cy - hy + (s - top), cz - hz]);
  }
  return pts;
}

/** ร้านเครื่องใช้ไฟฟ้า: a store with a TV wall in the window and a chase-lit bolt sign. */
export const item: ItemModel = {
  id: 'electronics-store',
  name: 'ร้านเครื่องใช้ไฟฟ้า',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([W + 0.1, BASE, L + 0.1], [0, BASE / 2, 0], 'stone'),
      kit.box([W, H - BASE, L], [0, (BASE + H) / 2, 0], 'cream'),
      kit.box([W + 0.02, 0.1, L + 0.02], [0, BASE + 0.05, 0], 'navy'),
      kit.box([W + 0.14, 0.08, L + 0.14], [0, H + 0.04, 0], 'blue'),
      // the TV wall: a dark frame, then a grid of screens in several colours
      ...wallPanel(kit, { at: [FRONT, 0.58, TV.z], facing: 'x+', w: 2.06, h: 0.84, depth: 0.02, color: 'charcoal' }),
      ...door(kit, { at: [FRONT, BASE + 0.27, 1.07], facing: 'x+', w: 0.4, h: 0.54, color: 'teal', knob: 'sunYellow' }),
      kit.box([0.1, 0.03, 0.5], [FRONT + 0.05, BASE + 0.015, 1.07], 'stone'),
      ...glassWindow(kit, { at: [FRONT, 0.84, 1.07], facing: 'x+', w: 0.3, h: 0.1, panes: 1 }),
    ];
    for (let r = 0; r < TV.rows; r++) {
      for (let c = 0; c < TV.cols; c++) {
        const color = SCREEN_COLORS[(r * 5 + c * 3) % SCREEN_COLORS.length];
        const z = TV.z + (c - (TV.cols - 1) / 2) * TV.pitchZ;
        const y = TV.y + (1 - r) * TV.pitchY;
        parts.push(...wallPanel(kit, { at: [FRONT, y, z], facing: 'x+', w: TV.w, h: TV.h, depth: 0.03, color, glow: color }));
      }
    }
    // windows on the other three walls
    for (const x of [-0.4, 0.4]) {
      parts.push(
        ...glassWindow(kit, { at: [x, 0.62, L / 2], facing: 'z+', w: 0.5, h: 0.34, panes: 2 }),
        ...glassWindow(kit, { at: [x, 0.62, -L / 2], facing: 'z-', w: 0.5, h: 0.34, panes: 2 }),
      );
    }
    for (const z of [-0.85, 0, 0.85]) parts.push(...glassWindow(kit, { at: [-FRONT, 0.62, z], facing: 'x-', w: 0.5, h: 0.34, panes: 2 }));
    // rooftop sign: board on two legs, a bolt neon and a run of chase bulbs round the edge
    const boardBottom = SIGN.y - SIGN.halfY - 0.03;
    for (const z of [-0.6, 0.6]) parts.push(kit.box([0.06, boardBottom - (H + 0.08), 0.06], [SIGN.x, (boardBottom + H + 0.08) / 2, z], 'charcoal'));
    parts.push(kit.box([0.06, SIGN.halfY * 2 + 0.06, SIGN.halfZ * 2 + 0.06], [SIGN.x, SIGN.y, 0], 'navy'));
    const bx = SIGN.x + 0.05;
    const bolt: [number, number][] = [[1.7, 0.14], [1.5, -0.04], [1.54, 0.08], [1.3, -0.14]];
    for (let i = 0; i < bolt.length - 1; i++) {
      parts.push(rod(kit, [bx, bolt[i][0], bolt[i][1]], [bx, bolt[i + 1][0], bolt[i + 1][1]], 0.03, 'skyBlue', { segments: 4, glow: 'skyBlue' }));
    }
    rectPoints(SIGN.y, 0, SIGN.halfY - 0.03, SIGN.halfZ - 0.03, SIGN.bulbs).forEach(([y, z], index) => {
      parts.push(kit.sphere(0.035, [SIGN.x + 0.05, y, z], 'lampWarm', { detail: 0, glow: true, light: 'chase', chase: { index, count: SIGN.bulbs } }));
    });
    return kit.finish(parts);
  },
};
