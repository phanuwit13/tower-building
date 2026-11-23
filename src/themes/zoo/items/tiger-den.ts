import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';

// A rocky den: a pile of rocks at the back with a dark mouth, a sunny ledge with a tiger asleep on it (closed eyes, no teeth), ferns around.
const BASE = { w: 1.96, h: 0.03 };
const LEDGE = { x: 0.1, z: 0.1, w: 1.0, d: 0.8, h: 0.32 }; // top of the ledge is at LEDGE.h
const TOP = LEDGE.h;
const TIGER = { x: 0.1, z: 0.12 };
const FERNS: Array<[number, number]> = [[0.8, -0.75], [0.8, 0.75], [-0.8, 0.75], [0.3, -0.75], [0.75, 0.0]];

/** ถ้ำเสือ: a tiger asleep on a rock ledge in the sun, rocks and ferns around. */
export const item: ItemModel = {
  id: 'tiger-den',
  name: 'ถ้ำเสือ',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const at = (lx: number, ly: number, lz = 0): Vec3 => [TIGER.x + lx, TOP + ly, TIGER.z + lz];
    const parts: Part[] = [
      kit.box([BASE.w, BASE.h, BASE.w], [0, BASE.h / 2, 0], 'lime'),
      // rock pile at the back with a dark cave mouth
      kit.sphere(0.5, [-0.5, 0.5, 0], 'stoneDark', { detail: 1, scale: [0.8, 0.95, 1.5] }),
      kit.sphere(0.4, [-0.55, 0.55, -0.55], 'stone', { detail: 0, scale: [1, 1, 1] }),
      kit.sphere(0.38, [-0.55, 0.5, 0.6], 'stone', { detail: 0, scale: [1, 1, 1] }),
      kit.sphere(0.3, [-0.7, 0.82, 0.1], 'stone', { detail: 0, scale: [1, 0.9, 1.2] }),
      kit.sphere(0.2, [-0.15, 0.16, 0.75], 'stoneDark', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.2, [0.7, 0.16, -0.7], 'stone', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.22, [-0.1, 0.45, 0.1], 'charcoal', { detail: 0, scale: [0.3, 1.2, 1.4] }), // dark den mouth peeking behind the ledge
      // the sunny ledge
      kit.box([LEDGE.w, LEDGE.h, LEDGE.d], [LEDGE.x, LEDGE.h / 2, LEDGE.z], 'stone'),
      kit.box([LEDGE.w + 0.1, 0.05, LEDGE.d + 0.1], [LEDGE.x, LEDGE.h - 0.01, LEDGE.z], 'sand'),
      // tiger lying along x, head to +x resting on its paws
      kit.sphere(0.2, at(-0.12, 0.2), 'orange', { scale: [1.8, 0.85, 1.0] }),
      kit.sphere(0.12, at(-0.12, 0.21), 'white', { detail: 0, scale: [1.6, 0.5, 1.1] }),
      kit.sphere(0.16, at(0.36, 0.17), 'orange', { scale: [1.0, 0.9, 1.1] }),
      kit.sphere(0.07, at(0.5, 0.12), 'white', { detail: 0, scale: [1, 0.8, 1.3] }),
      kit.sphere(0.03, at(0.56, 0.15), 'pink', { detail: 0 }),
      kit.sphere(0.06, at(0.38, 0.045, -0.12), 'white', { detail: 0, scale: [1.3, 0.7, 0.8] }), // paws
      kit.sphere(0.06, at(0.38, 0.045, 0.12), 'white', { detail: 0, scale: [1.3, 0.7, 0.8] }),
      kit.sphere(0.07, at(-0.34, 0.07, 0.17), 'orange', { detail: 0, scale: [1.4, 0.7, 0.8] }), // hind leg
      kit.cylinder(0.035, 0.03, 0.4, at(-0.42, 0.04, -0.22), 'orange', { segments: 6, rotate: [Math.PI / 2, 0, 0.9] }), // tail curled round
      kit.sphere(0.04, at(-0.5, 0.035, -0.38), 'charcoal', { detail: 0 }),
    ];
    for (const s of [-1, 1]) {
      parts.push(
        kit.sphere(0.05, at(0.3, 0.3, s * 0.12), 'orange', { detail: 0 }),
        kit.sphere(0.028, at(0.33, 0.3, s * 0.12), 'pink', { detail: 0 }),
        // closed eyes: thin dark slits
        kit.box([0.03, 0.012, 0.05], at(0.5, 0.235, s * 0.085), 'charcoal'),
      );
    }
    // stripes across the back
    for (let i = 0; i < 5; i++) {
      const x = -0.35 + i * 0.12;
      parts.push(kit.box([0.035, 0.012, 0.3 - Math.abs(i - 2) * 0.03], at(x, 0.36 - Math.abs(i - 2) * 0.02), 'charcoal'));
    }
    for (const [x, z] of FERNS) {
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + x;
        parts.push(kit.cone(0.05, 0.3, [x + 0.08 * Math.cos(a), 0.17, z + 0.08 * Math.sin(a)], 'leaf', { segments: 4, rotate: [Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7] }));
      }
    }
    return kit.finish(parts);
  },
};
