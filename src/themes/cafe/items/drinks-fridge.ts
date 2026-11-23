import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A wide glass-door fridge (2×2) facing +x: three lit glass doors showing three shelves of bottles
// (orange juice, milk, water, berry, lime), a bright header with fruit pictures and cups on top.
const BODY = { x0: -0.8, x1: 0.5, h: 1.3, d: 1.66 };
const SHELF_YS = [0.28, 0.62, 0.96];
const DRINKS: PaletteColor[] = ['orange', 'white', 'skyBlue', 'pink', 'lime', 'sunYellow', 'purple', 'red'];

/** ตู้แช่เครื่องดื่ม: a lit glass-door fridge with juice, milk and water bottles. */
export const item: ItemModel = {
  id: 'drinks-fridge',
  name: 'ตู้แช่เครื่องดื่ม',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit: StyleKit) => {
    const bw = BODY.x1 - BODY.x0;
    const cx = (BODY.x0 + BODY.x1) / 2;
    const parts: Part[] = [
      // cabinet shell (charcoal) with a bright teal top and a header band with fruit pictures on +x
      kit.box([bw, BODY.h, BODY.d], [cx, BODY.h / 2, 0], 'charcoal'),
      kit.box([bw + 0.04, 0.05, BODY.d + 0.04], [cx, BODY.h + 0.025, 0], 'teal'),
      kit.box([0.04, 0.2, BODY.d - 0.1], [BODY.x1 + 0.02, 1.17, 0], 'teal', { glow: 'teal', light: 'window' }),
      kit.sphere(0.07, [BODY.x1 + 0.06, 1.17, -0.55], 'orange', { detail: 0 }),
      kit.sphere(0.07, [BODY.x1 + 0.06, 1.17, 0], 'pink', { detail: 0 }),
      kit.sphere(0.07, [BODY.x1 + 0.06, 1.17, 0.5], 'lime', { detail: 0 }),
    ];
    const shelf = (face: 'x' | 'z', c: number, n: number): void => {
      // c: door centre along the face, n: outward offset of the glass plane
      const at = (along: number, out: number, y: number): Vec3 => (face === 'x' ? [out, y, along] : [along, y, out]);
      const sz = (t: number, h: number, w: number): Vec3 => (face === 'x' ? [t, h, w] : [w, h, t]);
      parts.push(
        kit.box(sz(0.03, 1.02, 0.52), at(c, n + 0.015, 0.58), 'glassBlue', { glow: 'windowWarm', light: 'window' }),
        kit.box(sz(0.05, 0.4, 0.03), at(c + 0.27, n + 0.08, 0.58), 'chrome'),
      );
      SHELF_YS.forEach((y, row) => {
        parts.push(kit.box(sz(0.16, 0.03, 0.52), at(c, n + 0.08, y), 'chrome'));
        for (let b = 0; b < 4; b++) {
          const bc = c - 0.18 + b * 0.12;
          const color = DRINKS[(Math.round(c * 10) + row * 2 + b + 8) % DRINKS.length];
          parts.push(
            kit.box(sz(0.09, 0.2, 0.08), at(bc, n + 0.08, y + 0.115), color),
            kit.box(sz(0.04, 0.06, 0.04), at(bc, n + 0.08, y + 0.245), color === 'white' ? 'sunYellow' : 'white'),
          );
        }
      });
    };
    // glass doors on the +x face (three) and on the +z face (two), bottles on lit shelves in front
    for (let d = 0; d < 3; d++) shelf('x', -0.55 + d * 0.55, BODY.x1);
    for (let d = 0; d < 2; d++) shelf('z', -0.4 + d * 0.55, BODY.d / 2);
    // three crates of bottles on top
    for (let i = 0; i < 3; i++) {
      const z = -0.5 + i * 0.5;
      parts.push(kit.box([0.3, 0.1, 0.34], [0.0, BODY.h + 0.1, z], 'woodDark'));
      for (let b = 0; b < 4; b++) {
        parts.push(kit.box([0.08, 0.14, 0.08], [-0.07 + (b % 2) * 0.14, BODY.h + 0.2, z - 0.08 + Math.floor(b / 2) * 0.16], DRINKS[(i * 3 + b * 2) % DRINKS.length]));
      }
    }
    return kit.finish(parts);
  },
};
