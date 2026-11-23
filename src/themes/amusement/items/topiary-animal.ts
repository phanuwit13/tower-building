import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

const PLANTER = { s: 0.9, h: 0.2 };
const Y0 = PLANTER.h + 0.02; // soil line, where the hedge starts
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, Y0, 0], amount: 0.1 };

/** ต้นไม้ตัดรูปสัตว์: a hedge clipped into an elephant (legs, round body, head, ears, curling trunk), in a square planter. */
export const item: ItemModel = {
  id: 'topiary-animal',
  name: 'ต้นไม้ตัดรูปสัตว์',
  category: 'nature',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([PLANTER.s, PLANTER.h, PLANTER.s], [0, PLANTER.h / 2, 0], 'terracotta'),
      kit.box([0.78, 0.04, 0.78], [0, PLANTER.h, 0], 'bark'),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([PLANTER.s + 0.04, 0.05, 0.07], [0, PLANTER.h + 0.015, s * (PLANTER.s / 2 - 0.03)], 'redDark'),
        kit.box([0.07, 0.05, PLANTER.s - 0.1], [s * (PLANTER.s / 2 - 0.03), PLANTER.h + 0.015, 0], 'redDark'),
      );
    }
    // four legs
    for (const x of [-0.2, 0.12]) {
      for (const z of [-0.11, 0.11]) parts.push(kit.cylinder(0.075, 0.075, 0.28, [x, Y0 + 0.14, z], 'leafDark', { segments: 8, motion: SWAY }));
    }
    parts.push(
      kit.sphere(0.22, [-0.04, Y0 + 0.4, 0], 'leaf', { scale: [1.25, 0.9, 0.85], motion: SWAY }), // body
      kit.sphere(0.16, [0.2, Y0 + 0.52, 0], 'leaf', { motion: SWAY }), // head
      kit.sphere(0.05, [-0.31, Y0 + 0.38, 0], 'leafDark', { detail: 0, motion: SWAY }), // tail
      kit.cylinder(0.06, 0.04, 0.3, [0.38, Y0 + 0.33, 0], 'leaf', { rotate: [0, 0, 0.3], segments: 8, motion: SWAY }), // trunk
      kit.sphere(0.05, [0.44, Y0 + 0.19, 0], 'leaf', { detail: 0, motion: SWAY }), // trunk tip
    );
    for (const s of [-1, 1]) parts.push(kit.sphere(0.12, [0.17, Y0 + 0.52, s * 0.17], 'leafDark', { scale: [0.3, 1, 0.9], motion: SWAY })); // ears
    return kit.finish(parts);
  },
};
