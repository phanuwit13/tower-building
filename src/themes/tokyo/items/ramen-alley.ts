import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door, glassWindow, rod, type Facing } from '../../../models/parts';

// A narrow lane (along z) between two rows of three tiny eateries. Each has a door with a plain-colour noren curtain,
// a red paper lantern that breathes (no writing anywhere), lit windows and a neon ramen bowl on its roof, each in
// a different colour. Two strings of lanterns cross the lane.
const G = 0.03; // paved ground slab
const LANE = 0.26; // half the lane width
const OUT = 0.96; // outer wall x
const SHOP_Z = 0.98; // shop length along z
const GROUND_H = 0.52;
const UPPER = { x0: 0.29, x1: 0.93, h: 0.24 }; // low upper floors, so the lane shows from the camera
const WALL: readonly PaletteColor[] = ['wood', 'cream', 'woodDark', 'cream', 'wood', 'cream'];
const UPPER_WALL: readonly PaletteColor[] = ['cream', 'mint', 'pink', 'mint', 'cream', 'sand'];
const ROOF: readonly PaletteColor[] = ['red', 'redDark', 'blue', 'terracotta', 'navy', 'red'];
const NOREN: readonly PaletteColor[] = ['navy', 'red', 'teal', 'purple', 'blue', 'redDark'];
const NEON: readonly PaletteColor[] = ['pink', 'blue', 'teal', 'orange', 'purple', 'red']; // mid colours, they do not bloom white
const EXTRA = [0, 0.08, 0.02, 0.05, 0, 0.1]; // taller upper floors for variety

/** ซอยราเมน: a narrow lane of tiny eateries with red paper lanterns and noren curtains. */
export const item: ItemModel = {
  id: 'ramen-alley',
  name: 'ซอยราเมน',
  category: 'food',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([2, G, 3], [0, G / 2, 0], 'stone')];
    for (const s of [1, -1]) {
      const laneFace: Facing = s > 0 ? 'x-' : 'x+';
      const outerFace: Facing = s > 0 ? 'x+' : 'x-';
      for (let i = 0; i < 3; i++) {
        const k = (s > 0 ? 0 : 3) + i;
        const z = (i - 1) * 1.0;
        const upperH = UPPER.h + EXTRA[k];
        const roofY = G + GROUND_H + upperH;
        parts.push(
          kit.box([OUT - LANE, GROUND_H, SHOP_Z], [s * ((OUT + LANE) / 2), G + GROUND_H / 2, z], WALL[k]),
          kit.box([UPPER.x1 - UPPER.x0, upperH, SHOP_Z - 0.04], [s * ((UPPER.x0 + UPPER.x1) / 2), G + GROUND_H + upperH / 2, z], UPPER_WALL[k]),
          kit.box([OUT - LANE + 0.02, 0.06, SHOP_Z], [s * ((OUT + LANE) / 2 - 0.01) , roofY + 0.03, z], ROOF[k]),
          ...door(kit, { at: [s * LANE, G + 0.19, z], facing: laneFace, w: 0.24, h: 0.36, color: 'woodDark' }),
          ...glassWindow(kit, { at: [s * UPPER.x0, G + GROUND_H + upperH / 2, z], facing: laneFace, w: 0.4, h: 0.14, panes: 2 }),
          ...glassWindow(kit, { at: [s * UPPER.x1, G + GROUND_H + upperH / 2, z], facing: outerFace, w: 0.5, h: 0.14, panes: 2 }),
          // noren: a rod and three plain strips over the door
          kit.box([0.03, 0.03, 0.3], [s * (LANE - 0.045), G + 0.4, z], 'woodDark'),
        );
        for (const dz of [-0.09, 0, 0.09]) parts.push(kit.box([0.02, 0.19, 0.08], [s * (LANE - 0.05), G + 0.3, z + dz], NOREN[k]));
        // wall lantern beside the door
        parts.push(kit.sphere(0.07, [s * (LANE - 0.07), G + 0.46, z + 0.36], 'red', { detail: 0, scale: [1, 1.2, 1], glow: true, light: 'breathe' }));
        // neon ramen bowl sign: a dark board on the roof facing +x with thin glowing strokes (bowl, chopsticks, steam)
        const sx = s * 0.6;
        const cy = roofY + 0.06 + 0.17;
        const sx2 = sx + 0.02;
        const line = (u1: number, v1: number, u2: number, v2: number) =>
          rod(kit, [sx2, cy + v1, z + u1], [sx2, cy + v2, z + u2], 0.012, NEON[k], { segments: 4, glow: true });
        parts.push(kit.box([0.03, 0.34, 0.44], [sx, cy, z], 'charcoal'));
        for (let a = 0; a < 4; a++) {
          const t1 = Math.PI + (a * Math.PI) / 4;
          const t2 = t1 + Math.PI / 4;
          parts.push(line(0.11 * Math.cos(t1), 0.02 + 0.11 * Math.sin(t1), 0.11 * Math.cos(t2), 0.02 + 0.11 * Math.sin(t2)));
        }
        parts.push(
          line(-0.12, 0.02, 0.12, 0.02),
          line(0.0, 0.04, 0.1, 0.14), line(0.05, 0.04, 0.15, 0.14),
          line(-0.06, 0.06, -0.06, 0.13), line(-0.11, 0.06, -0.11, 0.13),
        );
      }
    }
    // two strings of lanterns across the lane
    for (const z of [-0.5, 0.5]) {
      parts.push(kit.cylinder(0.01, 0.01, 0.56, [0, G + 0.68, z], 'charcoal', { segments: 4, rotate: [0, 0, Math.PI / 2] }));
      for (const x of [-0.1, 0.1]) parts.push(kit.sphere(0.065, [x, G + 0.6, z], 'red', { detail: 0, scale: [1, 1.2, 1], glow: true, light: 'breathe' }));
    }
    return kit.finish(parts);
  },
};
