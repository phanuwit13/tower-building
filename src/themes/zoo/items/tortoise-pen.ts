import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';

// A low stone wall round a grassy pen (2×2): two giant tortoises and a pile of lettuce.
const WALL = { size: 1.96, t: 0.12, h: 0.16 };
const GRASS_H = 0.04;

/** A friendly tortoise facing +x at `at` (on the grass), turned by `yaw`, `k` times the base size. */
function tortoise(kit: StyleKit, at: Vec3, yaw: number, k: number): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const pt = (lx: number, ly: number, lz: number): Vec3 => [at[0] + (lx * c + lz * s) * k, at[1] + ly * k, at[2] + (-lx * s + lz * c) * k];
  const rotate: Vec3 = [0, yaw, 0];
  return [
    kit.cylinder(0.27 * k, 0.29 * k, 0.07 * k, pt(0, 0.1, 0), 'wood', { segments: 12, scale: [1.1, 1, 0.95], rotate }),
    kit.dome(0.26 * k, pt(0, 0.12, 0), 'woodDark', { segments: 12, scale: [1.1, 0.8, 0.95], rotate }),
    // pale shell plates
    kit.sphere(0.07 * k, pt(0, 0.31, 0), 'sand', { detail: 0, scale: [1.1, 0.4, 1.1], rotate }),
    kit.sphere(0.06 * k, pt(0.15, 0.27, 0.11), 'sand', { detail: 0, scale: [1, 0.4, 1], rotate }),
    kit.sphere(0.06 * k, pt(0.15, 0.27, -0.11), 'sand', { detail: 0, scale: [1, 0.4, 1], rotate }),
    kit.sphere(0.06 * k, pt(-0.16, 0.26, 0.1), 'sand', { detail: 0, scale: [1, 0.4, 1], rotate }),
    kit.sphere(0.06 * k, pt(-0.16, 0.26, -0.1), 'sand', { detail: 0, scale: [1, 0.4, 1], rotate }),
    // head with big eyes and a smile
    kit.sphere(0.09 * k, pt(0.31, 0.15, 0), 'lime', { rotate }),
    kit.sphere(0.04 * k, pt(0.37, 0.185, 0.05), 'white', { detail: 0 }),
    kit.sphere(0.04 * k, pt(0.37, 0.185, -0.05), 'white', { detail: 0 }),
    kit.sphere(0.022 * k, pt(0.405, 0.185, 0.05), 'charcoal', { detail: 0 }),
    kit.sphere(0.022 * k, pt(0.405, 0.185, -0.05), 'charcoal', { detail: 0 }),
    kit.box([0.012 * k, 0.012 * k, 0.07 * k], pt(0.395, 0.125, 0), 'charcoal', { rotate }),
    // legs and tail
    kit.sphere(0.075 * k, pt(0.17, 0.04, 0.17), 'lime', { detail: 0, scale: [1.1, 0.8, 1], rotate }),
    kit.sphere(0.075 * k, pt(0.17, 0.04, -0.17), 'lime', { detail: 0, scale: [1.1, 0.8, 1], rotate }),
    kit.sphere(0.075 * k, pt(-0.17, 0.04, 0.17), 'lime', { detail: 0, scale: [1.1, 0.8, 1], rotate }),
    kit.sphere(0.075 * k, pt(-0.17, 0.04, -0.17), 'lime', { detail: 0, scale: [1.1, 0.8, 1], rotate }),
    kit.sphere(0.035 * k, pt(-0.31, 0.08, 0), 'lime', { detail: 0, rotate }),
  ];
}

/** คอกเต่ายักษ์: a low stone wall round a lawn, two giant tortoises and a lettuce pile. */
export const item: ItemModel = {
  id: 'tortoise-pen',
  name: 'คอกเต่ายักษ์',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const half = (WALL.size - WALL.t) / 2;
    const inner = WALL.size - 2 * WALL.t;
    const parts: Part[] = [
      kit.box([inner + 0.02, GRASS_H, inner + 0.02], [0, GRASS_H / 2, 0], 'lime'),
      kit.box([WALL.t, WALL.h, WALL.size], [half, WALL.h / 2, 0], 'stone'),
      kit.box([WALL.t, WALL.h, WALL.size], [-half, WALL.h / 2, 0], 'stone'),
      kit.box([inner, WALL.h, WALL.t], [0, WALL.h / 2, half], 'stone'),
      kit.box([inner, WALL.h, WALL.t], [0, WALL.h / 2, -half], 'stone'),
      // caps, a darker course at the base
      kit.box([WALL.t + 0.03, 0.03, WALL.size * 0.97], [half, WALL.h + 0.015, 0], 'white'),
      kit.box([WALL.t + 0.03, 0.03, WALL.size * 0.97], [-half, WALL.h + 0.015, 0], 'white'),
      kit.box([inner * 0.97, 0.03, WALL.t + 0.03], [0, WALL.h + 0.015, half], 'white'),
      kit.box([inner * 0.97, 0.03, WALL.t + 0.03], [0, WALL.h + 0.015, -half], 'white'),
      // lettuce pile
      kit.sphere(0.13, [0.55, GRASS_H + 0.07, 0.5], 'leaf', { detail: 0, scale: [1, 0.7, 1] }),
      kit.sphere(0.11, [0.68, GRASS_H + 0.06, 0.4], 'lime', { detail: 0, scale: [1, 0.7, 1] }),
      kit.sphere(0.1, [0.45, GRASS_H + 0.06, 0.66], 'lime', { detail: 0, scale: [1, 0.7, 1] }),
      kit.sphere(0.09, [0.58, GRASS_H + 0.15, 0.52], 'leafDark', { detail: 0, scale: [1, 0.7, 1] }),
      // rocks and a bush
      kit.sphere(0.16, [-0.6, GRASS_H + 0.08, -0.55], 'stoneDark', { detail: 0, scale: [1.2, 0.7, 1] }),
      kit.sphere(0.2, [-0.62, GRASS_H + 0.12, 0.5], 'leaf', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.13, [-0.45, GRASS_H + 0.08, 0.62], 'leafDark', { detail: 0 }),
    ];
    parts.push(...tortoise(kit, [0.1, GRASS_H, -0.35], 0.3, 1));
    parts.push(...tortoise(kit, [-0.25, GRASS_H, 0.15], 2.3, 0.75));
    return kit.finish(parts);
  },
};
