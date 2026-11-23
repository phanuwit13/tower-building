import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A sandy pen (long side along z) with a low wooden fence (open on +x for a wide entrance), a friendly two-humped
// camel facing +z, and a palm-leaf shade on four posts at the -z end.
const SAND_H = 0.03;
const FENCE = { x: 0.46, z: 0.94, h: 0.2, post: 0.04 };
const CAMEL = { z: 0.05, bodyY: 0.56 };
/** Four legs: [x, z]. */
const LEGS: Array<[number, number]> = [[0.1, CAMEL.z + 0.28], [-0.1, CAMEL.z + 0.28], [0.1, CAMEL.z - 0.27], [-0.1, CAMEL.z - 0.27]];
const SHADE = { y: 0.8, zFront: -0.28, zBack: -0.92, x: 0.3 };
/** Palm-leaf strips of the shade: alternate two greens. */
const STRIPS = 5;

/** คอกอูฐ: a sandy pen with a two-humped camel and a palm-leaf shade. */
export const item: ItemModel = {
  id: 'camel-pen',
  name: 'คอกอูฐ',
  category: 'animal',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.96, SAND_H, 1.96], [0, SAND_H / 2, 0], 'sand')];

    // --- low fence: -x side, both ends, and short returns on +x leaving a wide gap ---
    // rails are thin boxes between two points on the same axis
    const rail = (a: Vec3, b: Vec3) => parts.push(kit.box([Math.abs(b[0] - a[0]) + 0.03, 0.03, Math.abs(b[2] - a[2]) + 0.03], [(a[0] + b[0]) / 2, a[1], (a[2] + b[2]) / 2], 'wood'));
    const post = (x: number, z: number) => parts.push(kit.box([FENCE.post, FENCE.h, FENCE.post], [x, SAND_H + FENCE.h / 2, z], 'woodDark'));
    for (const z of [-0.94, -0.47, 0, 0.47, 0.94]) post(-FENCE.x, z);
    for (const x of [-0.15, 0.15, 0.46]) { post(x, 0.94); post(x, -0.94); }
    post(FENCE.x, 0.62); post(FENCE.x, -0.62);
    for (const y of [SAND_H + 0.07, SAND_H + 0.16]) {
      rail([-FENCE.x, y, -0.94], [-FENCE.x, y, 0.94]);
      rail([-FENCE.x, y, 0.94], [FENCE.x, y, 0.94]);
      rail([-FENCE.x, y, -0.94], [FENCE.x, y, -0.94]);
      rail([FENCE.x, y, 0.94], [FENCE.x, y, 0.62]);
      rail([FENCE.x, y, -0.94], [FENCE.x, y, -0.62]);
    }

    // --- the camel, facing +z ---
    const by = SAND_H + CAMEL.bodyY;
    parts.push(
      kit.sphere(0.2, [0, by, CAMEL.z], 'wood', { scale: [0.85, 0.8, 1.7] }), // body
      kit.sphere(0.12, [0, by + 0.17, CAMEL.z - 0.12], 'wood', { scale: [0.9, 1.15, 0.95] }), // hump 1
      kit.sphere(0.12, [0, by + 0.17, CAMEL.z + 0.14], 'wood', { scale: [0.9, 1.15, 0.95] }), // hump 2
      kit.sphere(0.06, [0, by - 0.02, CAMEL.z - 0.34], 'woodDark', { detail: 0, scale: [0.8, 1.1, 0.7] }), // tail
    );
    for (const [x, z] of LEGS) {
      const top = by - 0.1;
      parts.push(kit.cylinder(0.04, 0.034, top - SAND_H, [x, (top + SAND_H) / 2, z], 'wood', { segments: 8 }));
    }
    // curved neck going up and forward, then a head with a long snout and big eyes
    const nb: Vec3 = [0, by + 0.05, CAMEL.z + 0.32];
    const nm: Vec3 = [0, by + 0.24, CAMEL.z + 0.42];
    const nt: Vec3 = [0, by + 0.42, CAMEL.z + 0.5];
    parts.push(
      rod(kit, nb, nm, 0.06, 'wood', { segments: 6 }),
      rod(kit, nm, nt, 0.052, 'wood', { segments: 6 }),
      kit.sphere(0.1, [0, nt[1] + 0.04, nt[2] + 0.04], 'wood', { detail: 0, scale: [0.9, 0.9, 1] }),
      kit.sphere(0.07, [0, nt[1] + 0.0, nt[2] + 0.16], 'sand', { detail: 0, scale: [1, 0.85, 1.2] }), // muzzle
      kit.sphere(0.022, [0, nt[1] + 0.01, nt[2] + 0.235], 'charcoal', { detail: 0 }),
      kit.sphere(0.04, [0.075, nt[1] + 0.09, nt[2] + 0.09], 'white', { detail: 0 }),
      kit.sphere(0.04, [-0.075, nt[1] + 0.09, nt[2] + 0.09], 'white', { detail: 0 }),
      kit.sphere(0.022, [0.095, nt[1] + 0.09, nt[2] + 0.115], 'charcoal', { detail: 0 }),
      kit.sphere(0.022, [-0.095, nt[1] + 0.09, nt[2] + 0.115], 'charcoal', { detail: 0 }),
      kit.sphere(0.04, [0.09, nt[1] + 0.15, nt[2] - 0.02], 'woodDark', { detail: 0, scale: [0.7, 1.2, 0.8] }), // ears
      kit.sphere(0.04, [-0.09, nt[1] + 0.15, nt[2] - 0.02], 'woodDark', { detail: 0, scale: [0.7, 1.2, 0.8] }),
    );

    // --- palm-leaf shade: four posts and overlapping leaf strips, tilted down to the back ---
    const depth = SHADE.zFront - SHADE.zBack;
    for (const x of [-SHADE.x, SHADE.x]) {
      parts.push(
        kit.cylinder(0.025, 0.03, SHADE.y - SAND_H + 0.04, [x, (SHADE.y + SAND_H + 0.04) / 2 - 0.0, SHADE.zFront - 0.04], 'bark', { segments: 5 }),
        kit.cylinder(0.025, 0.03, SHADE.y - SAND_H - 0.06, [x, (SHADE.y - 0.06 + SAND_H) / 2, SHADE.zBack + 0.04], 'bark', { segments: 5 }),
      );
    }
    for (let k = 0; k < STRIPS; k++) {
      const z = SHADE.zBack + 0.04 + ((k + 0.5) / STRIPS) * (depth - 0.08);
      const color: PaletteColor = k % 2 ? 'leafDark' : 'leaf';
      parts.push(kit.box([0.76, 0.035, depth / STRIPS + 0.05], [0, SHADE.y - 0.06 + (0.1 * (z - SHADE.zBack)) / depth + 0.02, z], color));
    }
    return kit.finish(parts);
  },
};
