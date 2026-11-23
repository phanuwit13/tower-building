import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';

// A friendly cartoon seahorse (side view in the x-y plane, snout towards +x) curled on a pink scallop-shell plinth.
const BASE = { r: 0.42, h: 0.08 };
const SHELL = { r: 0.32, squash: 0.55 };
const Y0 = BASE.h + SHELL.r * SHELL.squash * 0.85; // the seahorse stands on the shell's crown
/** Body spheres from the head down to the curled tail tip: [x, y, radius, [sx, sy, sz]]. */
const BODY: Array<[number, number, number, Vec3]> = [
  [0.02, 1.0, 0.115, [1, 1, 1]], // head
  [-0.01, 0.88, 0.09, [1, 1, 1]], // neck
  [0.03, 0.74, 0.15, [1, 1.1, 1]], // chest
  [0.04, 0.58, 0.14, [1, 1.1, 1]], // belly
  [-0.01, 0.46, 0.09, [1, 1, 1]], // waist
  [-0.1, 0.38, 0.075, [1, 1, 1]], // tail curls forward again
  [-0.15, 0.3, 0.065, [1, 1, 1]],
  [-0.11, 0.22, 0.055, [1, 1, 1]],
  [-0.03, 0.2, 0.05, [1, 1, 1]],
  [0.04, 0.25, 0.04, [1, 1, 1]],
];

/** รูปปั้นม้าน้ำ: a friendly seahorse statue on a shell plinth (a decoration). */
export const item: ItemModel = {
  id: 'seahorse-statue',
  name: 'รูปปั้นม้าน้ำ',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(BASE.r, BASE.r + 0.02, BASE.h, [0, BASE.h / 2, 0], 'stone', { segments: 12 }),
      kit.dome(SHELL.r, [0, BASE.h, 0], 'white', { segments: 12, scale: [1, SHELL.squash, 1] }),
      // little shells round the rim
      ...Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return kit.sphere(0.055, [Math.cos(a) * 0.36, BASE.h + 0.04, -Math.sin(a) * 0.36], i % 2 === 0 ? 'pink' : 'sunYellow', { detail: 0, scale: [1, 0.6, 1] });
      }),
    ];
    BODY.forEach(([x, y, r, scale], i) => {
      parts.push(kit.sphere(r, [x, y + Y0 - 0.12, 0], 'orange', { detail: i < 4 ? 1 : 0, scale })); // smooth head and body, cheap tail
    });
    const ny = Y0 - 0.12;
    parts.push(
      // snout, eyes, crown
      kit.cylinder(0.035, 0.045, 0.2, [0.17, 0.98 + ny, 0], 'orange', { segments: 8, rotate: [0, 0, Math.PI / 2 + 0.1] }),
      kit.sphere(0.03, [0.06, 1.04 + ny, 0.09], 'white', { detail: 0 }),
      kit.sphere(0.03, [0.06, 1.04 + ny, -0.09], 'white', { detail: 0 }),
      kit.sphere(0.017, [0.085, 1.04 + ny, 0.095], 'charcoal', { detail: 0 }),
      kit.sphere(0.017, [0.085, 1.04 + ny, -0.095], 'charcoal', { detail: 0 }),
      kit.cone(0.035, 0.1, [0.0, 1.14 + ny, 0], 'sunYellow', { segments: 6 }),
      kit.cone(0.03, 0.08, [-0.07, 1.11 + ny, 0], 'sunYellow', { segments: 6, rotate: [0, 0, 0.5] }),
      kit.cone(0.03, 0.08, [0.07, 1.11 + ny, 0], 'sunYellow', { segments: 6, rotate: [0, 0, -0.5] }),
      // back fin and belly stripes
      kit.box([0.03, 0.22, 0.14], [-0.17, 0.72 + ny, 0], 'sunYellow', { rotate: [0, 0, 0.2] }),
      kit.box([0.04, 0.12, 0.1], [-0.16, 0.9 + ny, 0], 'sunYellow', { rotate: [0, 0, 0.15] }),
      kit.box([0.012, 0.05, 0.14], [0.18, 0.74 + ny, 0], 'sunYellow'),
      kit.box([0.012, 0.05, 0.12], [0.17, 0.6 + ny, 0], 'sunYellow'),
    );
    return kit.finish(parts);
  },
};
