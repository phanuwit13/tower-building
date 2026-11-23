import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { quadruped, type QuadSpec } from './cow-pen';

const FLOOR_H = 0.03;
const EDGE = 0.94;
const PIG: Omit<QuadSpec, 'x' | 'z' | 'yaw'> = {
  len: 0.5, wid: 0.3, hgt: 0.26, leg: 0.08, color: 'pink', head: 0.12, muzzle: 'pink', snout: 1.05,
  ear: 'perk', earColor: 'pink', tail: 'pink',
};

/** คอกหมู: a low pen with a pink sow, piglets, a mud patch and a little shelter. */
export const item: ItemModel = {
  id: 'pig-pen',
  name: 'คอกหมู',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.98, FLOOR_H, 1.98], [0, FLOOR_H / 2, 0], 'sand')];
    // low fence: posts every 0.63 and one plank rail
    for (const a of [-EDGE, -0.31, 0.31, EDGE]) {
      for (const b of [-EDGE, EDGE]) {
        parts.push(kit.box([0.07, 0.26, 0.07], [a, FLOOR_H + 0.13, b], 'woodDark'));
        if (Math.abs(a) < EDGE) parts.push(kit.box([0.07, 0.26, 0.07], [b, FLOOR_H + 0.13, a], 'woodDark'));
      }
    }
    for (const b of [-EDGE, EDGE]) {
      parts.push(kit.box([2 * EDGE, 0.1, 0.035], [0, FLOOR_H + 0.18, b], 'wood'), kit.box([0.035, 0.1, 2 * EDGE], [b, FLOOR_H + 0.18, 0], 'wood'));
    }
    // shelter in the back-left corner: four posts, a sloping roof and straw
    const sx = -0.55;
    const sz = -0.5;
    for (const [dx, dz, h] of [[-0.35, -0.38, 0.62], [-0.35, 0.38, 0.62], [0.35, -0.38, 0.48], [0.35, 0.38, 0.48]] as const) {
      parts.push(kit.box([0.06, h, 0.06], [sx + dx, FLOOR_H + h / 2, sz + dz], 'wood'));
    }
    parts.push(
      kit.box([0.86, 0.05, 0.92], [sx, FLOOR_H + 0.6, sz], 'terracotta', { rotate: [0, 0, -0.2] }),
      kit.box([0.5, 0.03, 0.6], [sx, FLOOR_H + 0.015, sz], 'sunYellow'),
    );
    // mud patch, trough
    parts.push(
      kit.cylinder(0.3, 0.3, 0.025, [0.15, FLOOR_H + 0.0125, -0.5], 'bark', { segments: 10, scale: [1.3, 1, 1] }),
      kit.box([0.7, 0.12, 0.22], [0.6, FLOOR_H + 0.06, 0.75], 'wood'),
      kit.box([0.6, 0.03, 0.14], [0.6, FLOOR_H + 0.115, 0.75], 'sunYellow'),
    );
    parts.push(
      ...quadruped(kit, FLOOR_H, { ...PIG, x: 0.25, z: 0.1, yaw: -0.5 }),
      ...quadruped(kit, FLOOR_H, { ...PIG, len: 0.26, wid: 0.16, hgt: 0.15, leg: 0.04, head: 0.065, x: 0.55, z: -0.15, yaw: 0.4, tail: undefined }),
      ...quadruped(kit, FLOOR_H, { ...PIG, len: 0.26, wid: 0.16, hgt: 0.15, leg: 0.04, head: 0.065, x: -0.15, z: 0.55, yaw: -1.2, tail: undefined }),
      ...quadruped(kit, FLOOR_H, { ...PIG, len: 0.26, wid: 0.16, hgt: 0.15, leg: 0.04, head: 0.065, x: -0.1, z: 0.1, yaw: 2.4, tail: undefined }),
    );
    return kit.finish(parts);
  },
};
