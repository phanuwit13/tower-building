import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';

// A wooden frame (two forked posts) holding a branch; a sleepy sloth hangs from the branch.
// Branch, leaves and sloth all share one sway pivot, below the sloth.
const GROUND = { s: 0.96, h: 0.03 };
const POST = { z: 0.4, h: 1.0, r: 0.055 };
const BRANCH_Y = 1.0;
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, 0.4, 0], amount: 0.06 };
const m = { motion: SWAY };

/** สลอธห้อยกิ่งไม้: a sleepy sloth hanging from a branch on a wooden frame. */
export const item: ItemModel = {
  id: 'sloth-branch',
  name: 'สลอธห้อยกิ่งไม้',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([GROUND.s, GROUND.h, GROUND.s], [0, GROUND.h / 2, 0], 'lime'),
      kit.box([0.2, 0.06, 0.2], [0, GROUND.h + 0.03, -POST.z], 'stone'),
      kit.box([0.2, 0.06, 0.2], [0, GROUND.h + 0.03, POST.z], 'stone'),
    ];
    for (const z of [-POST.z, POST.z]) {
      parts.push(
        kit.cylinder(POST.r, POST.r + 0.01, POST.h - 0.06, [0, 0.06 + (POST.h - 0.06) / 2 - 0.03, z], 'wood', { segments: 8 }),
        kit.cone(0.065, 0.07, [0, POST.h - 0.09 + 0.05, z], 'woodDark', { segments: 8 }),
      );
    }
    parts.push(
      // the branch (rests on the posts) with leaves
      kit.cylinder(0.05, 0.05, 2 * POST.z + 0.16, [0, BRANCH_Y + 0.02, 0], 'woodDark', { segments: 8, rotate: [Math.PI / 2, 0, 0], ...m }),
      kit.sphere(0.12, [0.0, BRANCH_Y + 0.12, 0.3], 'leaf', { detail: 0, scale: [1, 0.8, 1.2], ...m }),
      kit.sphere(0.1, [0.02, BRANCH_Y + 0.1, -0.3], 'leafDark', { detail: 0, scale: [1, 0.8, 1.2], ...m }),
      // sloth: round body hanging below, arms up over the branch, long sleepy face
      kit.sphere(0.16, [0.02, 0.62, 0], 'sand', { scale: [0.9, 1.3, 0.9], ...m }),
      kit.sphere(0.1, [0.1, 0.58, 0], 'cream', { detail: 0, scale: [0.6, 1.3, 1], ...m }),
      kit.sphere(0.13, [0.1, 0.9, 0], 'sand', { scale: [0.95, 0.9, 1.05], ...m }),
      kit.sphere(0.075, [0.2, 0.88, 0], 'cream', { detail: 0, scale: [0.6, 0.8, 1.1], ...m }),
      kit.sphere(0.03, [0.25, 0.89, 0], 'charcoal', { detail: 0, ...m }),
      kit.cone(0.04, 0.06, [0.1, 1.0, 0], 'sand', { segments: 6, ...m }),
    );
    for (const s of [-1, 1]) {
      parts.push(
        kit.sphere(0.055, [0.2, 0.94, s * 0.075], 'woodDark', { detail: 0, scale: [0.5, 1.2, 1.4], rotate: [s * 0.5, 0, 0], ...m }), // eye patches
        kit.box([0.012, 0.012, 0.05], [0.248, 0.94, s * 0.075], 'charcoal', m), // closed, sleepy eyes
        kit.cylinder(0.035, 0.035, 0.34, [0.06, 0.82, s * 0.17], 'sand', { segments: 6, rotate: [s * -0.1, 0, 0], ...m }), // arms
        kit.sphere(0.04, [0.06, BRANCH_Y + 0.0, s * 0.17], 'sand', { detail: 0, ...m }),
        kit.cylinder(0.04, 0.035, 0.22, [0.0, 0.47, s * 0.09], 'sand', { segments: 6, ...m }), // legs
        kit.box([0.012, 0.06, 0.012], [0.09, BRANCH_Y + 0.045, s * 0.17 + s * 0.02], 'cream', m), // claws
      );
    }
    // little tufts at the foot
    parts.push(kit.sphere(0.07, [-0.3, 0.09, 0.3], 'leaf', { detail: 0, scale: [1, 0.8, 1] }));
    return kit.finish(parts);
  },
};
