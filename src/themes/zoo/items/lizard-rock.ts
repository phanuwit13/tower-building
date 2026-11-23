import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A warm sunlit rock on a sandy patch, with a green lizard sunbathing on top, head to +x.
const SAND_H = 0.03;
const ROCK = { x: -0.04, z: 0, y: 0.28, rx: 0.37, ry: 0.26, rz: 0.34 }; // the main boulder's ellipsoid
/** Height of the main rock's surface at (x, z). */
const surface = (x: number, z: number): number => {
  const t = 1 - ((x - ROCK.x) / ROCK.rx) ** 2 - ((z - ROCK.z) / ROCK.rz) ** 2;
  return ROCK.y + ROCK.ry * Math.sqrt(Math.max(0, t));
};
const LIZ = { z: 0.02, lift: 0.05 };

/** ก้อนหินมีกิ้งก่า: a warm rock with a green lizard sunbathing. */
export const item: ItemModel = {
  id: 'lizard-rock',
  name: 'ก้อนหินมีกิ้งก่า',
  category: 'animal',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const at = (x: number, dy: number, z = LIZ.z): [number, number, number] => [x, surface(x, z) + LIZ.lift + dy, z];
    const parts: Part[] = [
      kit.cylinder(0.48, 0.48, SAND_H, [0, SAND_H / 2, 0], 'sand', { segments: 16 }),
      kit.sphere(1, [ROCK.x, ROCK.y, ROCK.z], 'wood', { scale: [ROCK.rx, ROCK.ry, ROCK.rz] }),
      kit.sphere(0.2, [-0.22, 0.17, -0.3], 'terracotta', { scale: [1.1, 0.75, 1] }),
      kit.sphere(0.16, [0.3, 0.12, 0.3], 'terracotta', { scale: [1.1, 0.7, 1] }),
      kit.sphere(0.11, [0.3, 0.1, -0.3], 'woodDark', { detail: 0, scale: [1.2, 0.7, 1] }),
      // a tiny cactus in the corner
      kit.sphere(0.06, [-0.38, SAND_H + 0.05, 0.3], 'leaf', { detail: 0, scale: [1, 1.5, 1] }),
      kit.sphere(0.03, [-0.38, SAND_H + 0.13, 0.3], 'pink', { detail: 0 }),
      // lizard: long body, big-eyed head, four splayed legs, a tail tapering away to -x with a curl
      kit.sphere(1, at(-0.02, 0.025), 'lime', { scale: [0.15, 0.045, 0.07] }),
      kit.sphere(0.07, at(0.17, 0.03), 'lime', { scale: [1.1, 0.7, 1] }),
      kit.sphere(0.02, at(0.21, 0.065, LIZ.z + 0.04), 'white', { detail: 0 }),
      kit.sphere(0.02, at(0.21, 0.065, LIZ.z - 0.04), 'white', { detail: 0 }),
      kit.sphere(0.011, at(0.225, 0.066, LIZ.z + 0.04), 'charcoal', { detail: 0 }),
      kit.sphere(0.011, at(0.225, 0.066, LIZ.z - 0.04), 'charcoal', { detail: 0 }),
      kit.sphere(1, at(-0.02, 0.07), 'leafDark', { detail: 0, scale: [0.12, 0.012, 0.03] }), // stripe along the back
    ];
    for (const sz of [-1, 1]) {
      parts.push(
        kit.sphere(1, at(0.09, 0.0, LIZ.z + sz * 0.09), 'lime', { detail: 0, scale: [0.04, 0.02, 0.025] }),
        kit.sphere(1, at(-0.12, 0.0, LIZ.z + sz * 0.09), 'lime', { detail: 0, scale: [0.04, 0.02, 0.025] }),
      );
    }
    // tail: shrinking balls following the rock, bending to +z
    const tail: Array<[number, number, number]> = [[-0.15, 0.03, 0.04], [-0.22, 0.026, 0.05], [-0.29, 0.022, 0.07], [-0.34, 0.018, 0.1]];
    for (const [x, r, z] of tail) parts.push(kit.sphere(r, at(x, r - 0.02, z), 'lime', { detail: 0 }));
    return kit.finish(parts);
  },
};
