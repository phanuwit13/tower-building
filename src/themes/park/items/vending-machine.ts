import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const BODY = { x: 0.56, h: 1.15, z: 0.64 };
const FX = BODY.x / 2; // front face (+x)
const SZ = BODY.z / 2; // side face (+z)
const COLOURS: PaletteColor[] = ['orange', 'red', 'leaf', 'sunYellow', 'pink', 'purple', 'lime', 'orange', 'blue'];
const SHELVES = [0.44, 0.66, 0.88];

/** ตู้กดเครื่องดื่ม: a drinks vending machine. Two glowing faces (front +x, side +z) of bottle rows at night; no brand, no text. */
export const item: ItemModel = {
  id: 'vending-machine',
  name: 'ตู้กดเครื่องดื่ม',
  category: 'food',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BODY.x, BODY.h, BODY.z], [0, BODY.h / 2, 0], 'blue'),
      kit.box([BODY.x + 0.02, 0.03, BODY.z + 0.02], [0, BODY.h + 0.015, 0], 'skyBlue'), // light, thin cap
      kit.box([BODY.x + 0.04, 0.06, BODY.z + 0.04], [0, 0.03, 0], 'navy'), // plinth
    ];
    // one bottle face: u runs along the face, d is the distance out of it. face 'x' uses z for u, face 'z' uses x.
    const face = (f: 'x' | 'z', uc: number, w: number): void => {
      const out = f === 'x' ? FX : SZ;
      const p = (u: number, y: number, d: number): [number, number, number] => (f === 'x' ? [out + d, y, u] : [u, y, out + d]);
      const sz = (d: number, h: number, ww: number): [number, number, number] => (f === 'x' ? [d, h, ww] : [ww, h, d]);
      parts.push(
        kit.box(sz(0.02, 0.1, w), p(uc, 1.04, 0.01), 'lampWarm', { glow: true, light: 'breathe' }), // plain light strip
        kit.box(sz(0.02, 0.72, w), p(uc, 0.65, 0.01), 'skyBlue', { glow: 'windowWarm', light: 'window' }),
      );
      SHELVES.forEach((sy, row) => {
        parts.push(kit.box(sz(0.06, 0.025, w), p(uc, sy - 0.075, 0.03), 'charcoal'));
        for (let c = 0; c < 3; c++) {
          const u = uc + (c - 1) * (w / 3.2);
          const col = COLOURS[row * 3 + c];
          parts.push(
            kit.cylinder(0.04, 0.04, 0.12, p(u, sy, 0.03), col, { segments: 6, glow: true }),
            kit.box([0.04, 0.045, 0.04], p(u, sy + 0.08, 0.03), col, { glow: true }), // neck
          );
        }
      });
    };
    face('x', -0.07, 0.44);
    face('z', 0, 0.44);
    // button strip on the front, right of the glass: coin plate and coloured pads, no digits
    parts.push(
      kit.box([0.025, 0.5, 0.1], [FX + 0.012, 0.7, 0.245], 'charcoal'),
      kit.box([0.03, 0.06, 0.06], [FX + 0.015, 0.88, 0.245], 'sunYellow'),
    );
    ['red', 'leaf', 'white'].forEach((c, i) => parts.push(kit.box([0.03, 0.04, 0.06], [FX + 0.015, 0.74 - i * 0.07, 0.245], c as PaletteColor)));
    // dispenser flap at the bottom of the front
    parts.push(
      kit.box([0.03, 0.13, 0.44], [FX + 0.015, 0.2, -0.07], 'charcoal'),
      kit.box([0.035, 0.07, 0.3], [FX + 0.0175, 0.2, -0.07], 'stoneDark'),
    );
    return kit.finish(parts);
  },
};
