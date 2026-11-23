import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { rod } from '../../../models/parts';

// A wooden bench (long side along z, facing +x) under a pergola smothered in vines. The leaf clumps on
// top of the beams sway together about the pergola's top rail.
const POST = { x: 0.4, z: 0.78, h: 0.92 };
const SEAT_Y = 0.31;
const TOP = POST.h; // top of the posts / beams
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, TOP + 0.03, 0], amount: 0.12 };

/** ม้านั่งใต้ซุ้ม: a bench under a vine-covered pergola; the leaves sway. */
export const item: ItemModel = {
  id: 'shaded-bench',
  name: 'ม้านั่งใต้ซุ้ม',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      // small paved pad
      kit.box([0.96, 0.03, 1.92], [0, 0.015, 0], 'stone'),
      // the bench
      kit.box([0.34, 0.05, 1.3], [0.02, SEAT_Y, 0], 'wood'),
      kit.box([0.05, 0.3, 1.3], [-0.14, SEAT_Y + 0.17, 0], 'wood', { rotate: [0, 0, -0.12] }),
      kit.box([0.28, 0.26, 0.05], [0.02, SEAT_Y - 0.15, 0.55], 'charcoal'),
      kit.box([0.28, 0.26, 0.05], [0.02, SEAT_Y - 0.15, -0.55], 'charcoal'),
      kit.box([0.3, 0.025, 1.3], [0.02, SEAT_Y + 0.03, 0], 'woodDark'),
    ];
    // pergola: four posts, long beams along z on both sides, cross rafters along x
    for (const sx of [1, -1]) {
      for (const sz of [1, -1]) {
        parts.push(kit.box([0.07, POST.h, 0.07], [sx * POST.x, 0.03 + POST.h / 2 - 0.015, sz * POST.z], 'woodDark'));
      }
      parts.push(kit.box([0.07, 0.07, 2 * POST.z + 0.14], [sx * POST.x, TOP, 0], 'wood'));
    }
    for (const z of [-0.78, -0.52, -0.26, 0, 0.26, 0.52, 0.78]) {
      parts.push(kit.box([2 * POST.x + 0.1, 0.04, 0.05], [0, TOP + 0.055, z], 'wood'));
    }
    // vines climbing the posts (still) and clumps of leaves on top (swaying)
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const) {
      parts.push(rod(kit, [sx * POST.x, 0.03, sz * POST.z], [sx * (POST.x - 0.03), 0.6, sz * (POST.z - 0.02)], 0.015, 'leafDark', { segments: 4 }));
      parts.push(kit.sphere(0.05, [sx * (POST.x - 0.03), 0.5, sz * (POST.z - 0.03)], 'leaf', { detail: 0 }));
    }
    const clumps: Array<[number, number, number, 'leaf' | 'leafDark' | 'lime']> = [
      [0.33, -0.62, 0.12, 'leaf'], [-0.33, -0.3, 0.13, 'leafDark'], [0.33, -0.08, 0.11, 'lime'], [-0.33, 0.22, 0.12, 'leaf'],
      [0.33, 0.4, 0.13, 'leafDark'], [-0.33, 0.68, 0.12, 'lime'], [0.33, 0.8, 0.1, 'leaf'], [-0.33, -0.72, 0.11, 'leaf'],
    ];
    for (const [x, z, r, color] of clumps) {
      parts.push(kit.sphere(r, [x, TOP + 0.1, z], color, { scale: [1.2, 0.7, 1.2], motion: SWAY }));
    }
    // little pink blossoms among the leaves
    for (const [x, z] of [[0.33, -0.6], [-0.33, 0.2], [0.33, 0.4]] as const) {
      parts.push(kit.sphere(0.03, [x, TOP + 0.19, z], 'pink', { detail: 0, motion: SWAY }));
    }
    return kit.finish(parts);
  },
};
