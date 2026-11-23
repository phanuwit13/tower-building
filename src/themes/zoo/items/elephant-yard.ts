import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import { aim, ICO_LOW } from '../../../models/parts';

// A grassy yard (2 x 3, long side along z) with a bathing pool at the +z end, a big elephant, a baby
// and a log to play with. Everything faces +x. A low wooden fence runs round the edge.
const BASE_H = 0.04; // the grass slab (ground surface >= 0.02)
const HALF = { x: 1, z: 1.5 };
const POOL = { x: 0.05, z: 0.9, rx: 0.78, rz: 0.5, rim: 0.05, water: 0.1 };
const WATER: MotionOpts = { kind: 'water', water: 'pond' };
const FENCE = { h: 0.17, post: 0.05, step: 0.5, inset: 0.05 };

/** One cartoon elephant, `s` times life size, standing on y = oy at (ox, oz) and facing +x. */
function elephant(kit: StyleKit, parts: Part[], ox: number, oy: number, oz: number, s: number): void {
  const p = (x: number, y: number, z: number): Vec3 => [ox + x * s, oy + y * s, oz + z * s];
  const tube = (a: Vec3, b: Vec3, r1: number, r2: number) => {
    const d: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const len = Math.hypot(...d);
    parts.push(kit.cylinder(r2 * s, r1 * s, len * s, p((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), 'stone', { segments: 8, rotate: aim(d) }));
  };
  parts.push(kit.sphere(0.4 * s, p(0, 0.68, 0), 'stone', { scale: [1.25, 0.95, 0.9] }));
  for (const lx of [-0.3, 0.32]) {
    for (const lz of [-0.2, 0.2]) {
      parts.push(
        kit.cylinder(0.12 * s, 0.11 * s, 0.5 * s, p(lx, 0.25, lz), 'stone', { segments: 8 }),
        kit.cylinder(0.115 * s, 0.115 * s, 0.05 * s, p(lx, 0.025, lz), 'stoneDark', { segments: 8 }),
      );
    }
  }
  parts.push(kit.sphere(0.29 * s, p(0.5, 0.82, 0), 'stone'));
  // ears: big floppy discs with a pink inside, turned out a little
  for (const side of [-1, 1]) {
    parts.push(
      kit.sphere(0.28 * s, p(0.38, 0.86, side * 0.3), 'stoneDark', { scale: [0.22, 1, 0.95], rotate: [0, side * 0.35, 0] }),
      kit.sphere(0.2 * s, p(0.4, 0.84, side * 0.335), 'pink', { scale: [0.2, 0.9, 0.85], rotate: [0, side * 0.35, 0] }),
    );
  }
  // trunk curling down and up at the tip
  tube([0.72, 0.8, 0], [0.88, 0.56, 0], 0.12, 0.095);
  tube([0.88, 0.56, 0], [0.86, 0.3, 0], 0.095, 0.075);
  tube([0.86, 0.3, 0], [0.97, 0.2, 0], 0.075, 0.06);
  parts.push(kit.sphere(0.06 * s, p(0.99, 0.2, 0), 'stone', { detail: 0 }), kit.sphere(0.1 * s, p(0.72, 0.8, 0), 'stone', { detail: 0 }));
  // tusks
  for (const side of [-1, 1]) {
    const d: Vec3 = [0.8, -0.35, side * 0.35];
    const len = Math.hypot(...d);
    const base: Vec3 = [0.66, 0.68, side * 0.13];
    parts.push(kit.cone(0.04 * s, 0.2 * s, p(base[0] + (d[0] / len) * 0.1, base[1] + (d[1] / len) * 0.1, base[2] + (d[2] / len) * 0.1), 'white', { segments: 6, rotate: aim(d) }));
    parts.push(kit.sphere(0.052 * s, p(0.715, 0.915, side * 0.14), 'white', { detail: 0 }), kit.sphere(0.032 * s, p(0.755, 0.915, side * 0.14), 'charcoal', { detail: 0 }));
  }
  // tail
  tube([-0.48, 0.74, 0], [-0.58, 0.42, 0], 0.03, 0.025);
  parts.push(kit.sphere(0.05 * s, p(-0.58, 0.4, 0), 'stoneDark', { detail: 0 }));
}

/** คอกช้างมีสระ: a yard with a bathing pool, a big elephant, a baby and a log. */
export const item: ItemModel = {
  id: 'elephant-yard',
  name: 'คอกช้างมีสระ',
  category: 'animal',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([HALF.x * 2, BASE_H, HALF.z * 2], [0, BASE_H / 2, 0], 'lime')];
    // pool: stone rim, water above it
    parts.push(
      kit.cylinder(1, 1, POOL.rim + BASE_H, [POOL.x, (POOL.rim + BASE_H) / 2, POOL.z], 'stone', { segments: 16, scale: [POOL.rx + 0.08, 1, POOL.rz + 0.08] }),
      kit.cylinder(1, 1, POOL.water, [POOL.x, POOL.water / 2, POOL.z], 'navy', { segments: 16, scale: [POOL.rx, 1, POOL.rz], motion: WATER }),
    );
    // a few rocks on the rim
    for (const [x, z, r] of [[-0.78, 0.5, 0.1], [0.82, 1.25, 0.09], [-0.7, 1.3, 0.11]] as const) {
      parts.push(kit.sphere(r, [x, BASE_H + r * 0.6 * ICO_LOW, z], 'stoneDark', { detail: 0, scale: [1.2, 0.6, 1] }));
    }
    elephant(kit, parts, -0.2, BASE_H, -0.7, 1);
    elephant(kit, parts, 0.4, BASE_H, 0.0, 0.55);
    // the log: a trunk on its side with pale ends, and a small stump beside it
    parts.push(
      kit.cylinder(0.1, 0.1, 0.55, [0.72, BASE_H + 0.1, -1.1], 'wood', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.082, 0.082, 0.57, [0.72, BASE_H + 0.1, -1.1], 'sand', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.1, 0.1, 0.5, [0.72, BASE_H + 0.1, -1.1], 'wood', { segments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.cylinder(0.1, 0.11, 0.16, [0.55, BASE_H + 0.08, -0.55], 'woodDark', { segments: 8 }),
      kit.cylinder(0.085, 0.085, 0.165, [0.55, BASE_H + 0.08, -0.55], 'sand', { segments: 8 }),
      // shade bush in the back corner
      kit.sphere(0.2, [-0.8, BASE_H + 0.14, -1.25], 'leafDark', { scale: [1, 0.8, 1] }),
      kit.sphere(0.15, [-0.65, BASE_H + 0.1, -1.3], 'leaf', { scale: [1, 0.8, 1] }),
    );
    // low fence round the yard
    const fx = HALF.x - FENCE.inset;
    const fz = HALF.z - FENCE.inset;
    for (let z = -fz; z <= fz + 1e-6; z += FENCE.step) {
      for (const x of [-fx, fx]) parts.push(kit.box([FENCE.post, FENCE.h, FENCE.post], [x, BASE_H + FENCE.h / 2, z], 'wood'));
    }
    for (let x = -fx + FENCE.step; x < fx - 0.1; x += FENCE.step) {
      for (const z of [-fz, fz]) parts.push(kit.box([FENCE.post, FENCE.h, FENCE.post], [x, BASE_H + FENCE.h / 2, z], 'wood'));
    }
    const railY = BASE_H + FENCE.h * 0.7;
    parts.push(
      kit.box([0.03, 0.035, fz * 2], [-fx, railY, 0], 'woodDark'), kit.box([0.03, 0.035, fz * 2], [fx, railY, 0], 'woodDark'),
      kit.box([fx * 2, 0.035, 0.03], [0, railY, -fz], 'woodDark'), kit.box([fx * 2, 0.035, 0.03], [0, railY, fz], 'woodDark'),
    );
    return kit.finish(parts);
  },
};
