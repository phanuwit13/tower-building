import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { Facing } from '../../../models/parts';

// A small wooden tea house (2×2, front on +x): dark timber frame with paper screens (white, glowing warm at night), a square hip
// roof, a veranda and a path of stepping stones on a raked sand garden.
const GARDEN_H = 0.03;
const FLOOR_H = 0.12; // house floor top
const BODY = { cx: -0.3, w: 1.1, d: 1.2, h: 0.62 }; // w along x, d along z
const WALL_TOP = FLOOR_H + BODY.h;
const FRONT = BODY.cx + BODY.w / 2;
const SCREEN_Y = FLOOR_H + 0.36;
const SCREEN_H = 0.4;

/** โรงน้ำชา: a wooden tea house with paper screens. */
export const item: ItemModel = {
  id: 'tea-house',
  name: 'โรงน้ำชา',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.9, GARDEN_H, 1.9], [0, GARDEN_H / 2, 0], 'sand'),
      kit.box([BODY.w + 0.1, FLOOR_H - GARDEN_H, BODY.d + 0.1], [BODY.cx, GARDEN_H + (FLOOR_H - GARDEN_H) / 2, 0], 'stoneDark'),
      kit.box([BODY.w, BODY.h, BODY.d], [BODY.cx, FLOOR_H + BODY.h / 2, 0], 'woodDark'),
      // beams under the roof
      kit.box([BODY.w + 0.04, 0.06, BODY.d + 0.04], [BODY.cx, WALL_TOP - 0.03, 0], 'wood'),
    ];
    // paper screens on each wall, three panes with a timber lattice (vertical bars and two cross bars)
    const wall = (facing: Facing, len: number, at: (u: number, y: number) => [number, number, number]) => {
      const pane = (len - 0.16) / 3;
      for (let i = 0; i < 3; i++) {
        const u = -len / 2 + 0.08 + pane * (i + 0.5);
        parts.push(kit.box(facing[0] === 'x' ? [0.02, SCREEN_H, pane - 0.04] : [pane - 0.04, SCREEN_H, 0.02], at(u, SCREEN_Y), 'white', { glow: 'windowWarm', light: 'window' }));
      }
      for (let i = 0; i < 4; i++) {
        const u = -len / 2 + 0.08 + pane * i;
        parts.push(kit.box(facing[0] === 'x' ? [0.035, SCREEN_H + 0.03, 0.03] : [0.03, SCREEN_H + 0.03, 0.035], at(u, SCREEN_Y), 'wood'));
      }
      for (const dy of [0, 0.13]) {
        const mid = at(0, SCREEN_Y + dy);
        parts.push(kit.box(facing[0] === 'x' ? [0.035, 0.025, len - 0.1] : [len - 0.1, 0.025, 0.035], mid, 'wood'));
      }
    };
    wall('x+', BODY.d, (u, y) => [FRONT + 0.012, y, u]);
    wall('x-', BODY.d, (u, y) => [BODY.cx - BODY.w / 2 - 0.012, y, u]);
    wall('z+', BODY.w, (u, y) => [BODY.cx + u, y, BODY.d / 2 + 0.012]);
    wall('z-', BODY.w, (u, y) => [BODY.cx + u, y, -BODY.d / 2 - 0.012]);
    // square hip roof: a four-sided cone turned 45 degrees, dark tiles with a ridge cap and a finial
    const ROOF = { r: 0.94, h: 0.5 };
    parts.push(kit.cone(ROOF.r, ROOF.h, [BODY.cx, WALL_TOP + ROOF.h / 2, 0], 'charcoal', { segments: 4, rotate: [0, Math.PI / 4, 0] }));
    parts.push(kit.sphere(0.06, [BODY.cx, WALL_TOP + ROOF.h + 0.03, 0], 'brass', { detail: 0 }));
    // veranda in front: wood deck, two posts, a small glowing lantern
    parts.push(kit.box([0.3, 0.1, BODY.d + 0.1], [FRONT + 0.15, 0.05 + GARDEN_H / 2, 0], 'wood'));
    for (const z of [-0.55, 0.55]) {
      parts.push(kit.cylinder(0.035, 0.04, 0.5, [FRONT + 0.25, 0.1 + 0.25, z], 'woodDark', { segments: 6 }));
    }
    parts.push(kit.sphere(0.07, [FRONT + 0.25, 0.65, 0.55], 'red', { glow: true, light: 'breathe', scale: [1, 1.2, 1] }));
    // stepping stones from the veranda out to +x
    const STONES: [number, number][] = [
      [0.58, 0.0],
      [0.72, 0.14],
      [0.85, -0.05],
    ];
    for (const [x, z] of STONES) parts.push(kit.cylinder(0.1, 0.11, 0.03, [x, GARDEN_H + 0.015, z], 'stone', { segments: 8 }));
    parts.push(kit.sphere(0.12, [0.7, GARDEN_H + 0.07, -0.6], 'leafDark', { scale: [1.3, 0.8, 1.1] })); // moss bush
    parts.push(kit.sphere(0.09, [0.84, GARDEN_H + 0.05, -0.72], 'leaf', { scale: [1.2, 0.8, 1.1] }));
    return kit.finish(parts);
  },
};
