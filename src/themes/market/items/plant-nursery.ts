import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { gableRoof, glassWindow, rod } from '../../../models/parts';

// A garden shop (2×2, front on +x): a greenhouse corner at the back, a shelf of potted plants,
// a rail of swinging hanging baskets, glowing lanterns and a lime leaf neon on a post.
const GROUND = 0.04;
const GH = { x: -0.48, z: -0.45, w: 0.8, d: 0.9, wall: 0.5, rise: 0.3 }; // greenhouse
const SHELF = { x: 0.6, z: -0.35, w: 0.36, d: 1.1, h: 0.32 };
const RAIL = { z: 0.78, y: 0.95, x0: -0.7, x1: 0.1 };
const SWING_BASKET: MotionOpts = { kind: 'swing', axis: [1, 0, 0], amount: 0.1, speed: 1.4 };
const POT_COLORS = ['pink', 'sunYellow', 'purple', 'orange', 'pink'] as const;

/** ร้านต้นไม้: a plant nursery with a greenhouse, pots, hanging baskets and lanterns. */
export const item: ItemModel = {
  id: 'plant-nursery',
  name: 'ร้านต้นไม้',
  category: 'nature',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.9, GROUND, 1.9], [0, GROUND / 2, 0], 'sand')];
    // greenhouse: low white base, glass panes on every side, glass roof
    parts.push(
      kit.box([GH.w, GH.wall, GH.d], [GH.x, GROUND + GH.wall / 2, GH.z], 'white'),
      kit.wedge([GH.w, GH.rise, GH.d - 0.02], [GH.x, GROUND + GH.wall + GH.rise / 2, GH.z], 'glassBlue'),
      ...gableRoof(kit, { at: [GH.x, GROUND + GH.wall, GH.z], length: GH.d + 0.06, width: GH.w, rise: GH.rise, eave: 0.03, color: 'glassBlue', ridge: 'white' }),
      ...glassWindow(kit, { at: [GH.x + GH.w / 2, GROUND + 0.27, GH.z], facing: 'x+', w: 0.7, h: 0.32, panes: 3 }),
      ...glassWindow(kit, { at: [GH.x, GROUND + 0.27, GH.z + GH.d / 2], facing: 'z+', w: 0.5, h: 0.32, panes: 2 }),
      ...glassWindow(kit, { at: [GH.x, GROUND + 0.27, GH.z - GH.d / 2], facing: 'z-', w: 0.5, h: 0.32, panes: 2 }),
      ...glassWindow(kit, { at: [GH.x - GH.w / 2, GROUND + 0.27, GH.z], facing: 'x-', w: 0.7, h: 0.32, panes: 3 }),
      kit.sphere(0.09, [GH.x, GROUND + GH.wall + GH.rise + 0.1, GH.z + 0.2], 'leaf', { detail: 0 }),
    );
    // shelf of potted plants
    parts.push(
      kit.box([SHELF.w, 0.05, SHELF.d], [SHELF.x, GROUND + SHELF.h, SHELF.z], 'wood'),
      kit.box([SHELF.w - 0.04, SHELF.h - 0.02, SHELF.d - 0.04], [SHELF.x, GROUND + (SHELF.h - 0.02) / 2, SHELF.z], 'woodDark'),
    );
    const shelfTop = GROUND + SHELF.h + 0.025;
    POT_COLORS.forEach((color, i) => {
      const z = SHELF.z - 0.42 + i * 0.21;
      const sway: MotionOpts = { kind: 'sway', pivot: [SHELF.x, shelfTop + 0.1, z], amount: 0.15 };
      parts.push(
        kit.cylinder(0.075, 0.055, 0.12, [SHELF.x, shelfTop + 0.06, z], 'terracotta', { segments: 8 }),
        kit.sphere(0.1, [SHELF.x, shelfTop + 0.19, z], i % 2 ? 'leaf' : 'leafDark', { detail: 0, motion: sway }),
        kit.sphere(0.04, [SHELF.x + 0.02, shelfTop + 0.29, z], color, { detail: 0, motion: sway }),
      );
    });
    // big pots on the ground out front
    for (const [x, z, r] of [[0.45, 0.45, 0.13], [0.7, 0.62, 0.1], [0.28, 0.12, 0.1]] as const) {
      const sway: MotionOpts = { kind: 'sway', pivot: [x, GROUND + r * 1.7, z], amount: 0.12 };
      parts.push(
        kit.cylinder(r, r * 0.7, r * 1.6, [x, GROUND + r * 0.8, z], 'terracotta', { segments: 8 }),
        kit.sphere(r * 1.15, [x, GROUND + r * 2.3, z], 'leaf', { detail: 0, motion: sway }),
        kit.sphere(r * 0.5, [x + r * 0.3, GROUND + r * 3.2, z], 'pink', { detail: 0, motion: sway }),
      );
    }
    // hanging-basket rail: two posts, a beam, three baskets and two lanterns
    for (const x of [RAIL.x0, RAIL.x1]) {
      parts.push(
        kit.cylinder(0.03, 0.03, RAIL.y - GROUND, [x, GROUND + (RAIL.y - GROUND) / 2, RAIL.z], 'charcoal', { segments: 6 }),
        kit.sphere(0.075, [x, RAIL.y + 0.1, RAIL.z], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }),
      );
    }
    parts.push(kit.box([RAIL.x1 - RAIL.x0 + 0.06, 0.05, 0.05], [(RAIL.x0 + RAIL.x1) / 2, RAIL.y, RAIL.z], 'charcoal'));
    [-0.55, -0.3, -0.05].forEach((x, i) => {
      const swing: MotionOpts = { ...SWING_BASKET, pivot: [x, RAIL.y, RAIL.z], phase: i * 0.7 };
      parts.push(
        kit.cylinder(0.012, 0.012, 0.2, [x, RAIL.y - 0.1, RAIL.z], 'stoneDark', { segments: 4, motion: swing }),
        kit.sphere(0.1, [x, RAIL.y - 0.25, RAIL.z], 'terracotta', { detail: 0, scale: [1, 0.6, 1], motion: swing }),
        kit.sphere(0.11, [x, RAIL.y - 0.2, RAIL.z], i % 2 ? 'leaf' : 'leafDark', { detail: 0, scale: [1, 0.7, 1], motion: swing }),
        kit.sphere(0.04, [x + 0.04, RAIL.y - 0.14, RAIL.z + 0.03], ['pink', 'sunYellow', 'purple'][i] as 'pink', { detail: 0, motion: swing }),
      );
    });
    // lime leaf neon on a round board on a post at the front corner
    const sx = 0.85;
    const sz = 0.12;
    parts.push(
      kit.cylinder(0.03, 0.03, 1.05, [sx, GROUND + 0.525, sz], 'charcoal', { segments: 6 }),
      kit.cylinder(0.27, 0.27, 0.05, [sx, 1.3, sz], 'navy', { segments: 14, rotate: [0, 0, Math.PI / 2] }),
      kit.sphere(0.2, [sx + 0.05, 1.32, sz + 0.02], 'lime', { detail: 1, scale: [0.1, 1, 0.5], rotate: [0.7, 0, 0], glow: 'lime' }),
      rod(kit, [sx + 0.05, 1.12, sz - 0.1], [sx + 0.05, 1.3, sz + 0.0], 0.018, 'lime', { segments: 4, glow: 'lime' }),
    );
    return kit.finish(parts);
  },
};
