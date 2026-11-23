import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';

// A friendly golden dog sitting on a soft mat, facing +x, in a teal vest with a heart on each side and on the chest.
const MAT = { s: 0.9, h: 0.03 };
const BASE = MAT.h;
const HIPS: Vec3 = [-0.1, BASE + 0.15, 0];
const CHEST: Vec3 = [0.04, BASE + 0.25, 0];
const HEAD: Vec3 = [0.12, BASE + 0.52, 0];
const HEAD_R = 0.16;

/** สุนัขบำบัด: a friendly therapy dog in a heart vest, sitting on a mat. */
export const item: ItemModel = {
  id: 'therapy-dog',
  name: 'สุนัขบำบัด',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([MAT.s, MAT.h, MAT.s], [0, MAT.h / 2, 0], 'mint'),
      kit.box([MAT.s, 0.01, 0.06], [0, MAT.h + 0.005, MAT.s / 2 - 0.03], 'sunYellow'),
      kit.sphere(1, HIPS, 'sand', { scale: [0.2, 0.15, 0.2] }),
      kit.sphere(1, CHEST, 'sand', { scale: [0.15, 0.2, 0.16] }),
      // vest over the back and ribs
      kit.sphere(1, [-0.0, BASE + 0.27, 0], 'teal', { scale: [0.145, 0.15, 0.168] }),
      kit.sphere(1, HEAD, 'sand', { scale: [0.95, 0.9, 0.95].map((v) => v * HEAD_R) as Vec3 }),
      // muzzle, nose, eyes
      kit.sphere(1, [HEAD[0] + 0.14, HEAD[1] - 0.04, 0], 'cream', { detail: 1, scale: [0.09, 0.065, 0.075] }),
      kit.sphere(0.028, [HEAD[0] + 0.225, HEAD[1] - 0.025, 0], 'charcoal', { detail: 0 }),
      kit.sphere(1, [HEAD[0] + 0.115, HEAD[1] + 0.035, -0.06], 'charcoal', { detail: 0, scale: [0.02, 0.03, 0.025] }),
      kit.sphere(1, [HEAD[0] + 0.115, HEAD[1] + 0.035, 0.06], 'charcoal', { detail: 0, scale: [0.02, 0.03, 0.025] }),
      kit.sphere(1, [HEAD[0] + 0.15, HEAD[1] - 0.095, 0], 'pink', { detail: 0, scale: [0.03, 0.012, 0.03] }), // tongue
      // floppy ears
      kit.sphere(1, [HEAD[0] - 0.02, HEAD[1] - 0.02, -0.16], 'wood', { detail: 1, scale: [0.06, 0.11, 0.05] }),
      kit.sphere(1, [HEAD[0] - 0.02, HEAD[1] - 0.02, 0.16], 'wood', { detail: 1, scale: [0.06, 0.11, 0.05] }),
      // front legs and paws, back paws
      kit.cylinder(0.04, 0.045, 0.22, [0.1, BASE + 0.11, -0.07], 'sand', { segments: 8 }),
      kit.cylinder(0.04, 0.045, 0.22, [0.1, BASE + 0.11, 0.07], 'sand', { segments: 8 }),
      kit.sphere(1, [0.13, BASE + 0.02, -0.07], 'cream', { detail: 0, scale: [0.07, 0.03, 0.05] }),
      kit.sphere(1, [0.13, BASE + 0.02, 0.07], 'cream', { detail: 0, scale: [0.07, 0.03, 0.05] }),
      kit.sphere(1, [0.0, BASE + 0.025, -0.19], 'cream', { detail: 0, scale: [0.09, 0.035, 0.05] }),
      kit.sphere(1, [0.0, BASE + 0.025, 0.19], 'cream', { detail: 0, scale: [0.09, 0.035, 0.05] }),
      // tail wagging low on the mat (still), curled up at the tip
      kit.sphere(1, [-0.3, BASE + 0.05, 0.03], 'sand', { detail: 1, scale: [0.14, 0.045, 0.05], rotate: [0, 0, 0.15] }),
      kit.sphere(0.045, [-0.43, BASE + 0.08, 0.03], 'cream', { detail: 0 }),
    ];
    // vest hearts: two lobes and a point, on the +z side, the -z side and the chest (+x)
    const heart = (at: Vec3, axis: 'x' | 'z', out: number): void => {
      const [x, y, z] = at;
      for (const l of [-1, 1]) {
        const p: Vec3 = axis === 'z' ? [x + l * 0.017, y + 0.014, z] : [x, y + 0.014, z + l * 0.017];
        parts.push(kit.sphere(1, p, 'red', { detail: 0, scale: axis === 'z' ? [0.021, 0.021, 0.008] : [0.008, 0.021, 0.021] }));
      }
      const tip: Vec3 = [x, y - 0.012, z];
      parts.push(kit.cone(0.032, 0.04, tip, 'red', { segments: 4, rotate: axis === 'z' ? [Math.PI, Math.PI / 4, 0] : [Math.PI, Math.PI / 4, 0], scale: axis === 'z' ? [1, 1, 0.3] : [0.3, 1, 1] }));
      void out;
    };
    heart([0.0, BASE + 0.28, 0.168], 'z', 1);
    heart([0.0, BASE + 0.28, -0.168], 'z', -1);
    heart([0.188, BASE + 0.29, 0], 'x', 1);
    // a collar band round the neck
    parts.push(kit.cylinder(0.12, 0.13, 0.04, [0.07, BASE + 0.38, 0], 'teal', { segments: 10 }));
    return kit.finish(parts);
  },
};
