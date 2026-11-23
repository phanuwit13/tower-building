import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A big flat sunning rock on a lawn. A maned lion lounges on top, a lioness lies in the grass below.
const GROUND_H = 0.03;
const ROCK = { x: -0.15, z: -0.1, top: 0.38 }; // top of the flat rock

/** A lying cat seen from the side: `yaw` 0 faces +x, `lion` adds the mane. `y` is the surface it lies on. */
function lyingCat(kit: StyleKit, x: number, y: number, z: number, yaw: number, lion: boolean): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const at = (f: number, side: number, up: number): Vec3 => [x + f * c + side * s, y + up, z - f * s + side * c];
  const rot: Vec3 = [0, yaw, 0];
  const fur = lion ? 'sunYellow' : 'sand';
  const parts: Part[] = [
    kit.sphere(0.2, at(-0.04, 0, 0.13), fur, { scale: [1.5, 0.7, 0.85], rotate: rot }),
    // head resting up, big eyes, muzzle and nose
    kit.sphere(0.12, at(0.27, 0, 0.19), fur, { rotate: rot }),
    kit.sphere(0.06, at(0.36, 0, 0.16), 'cream', { detail: 0, scale: [1, 0.8, 1.1], rotate: rot }),
    kit.sphere(0.022, at(0.41, 0, 0.18), 'charcoal', { detail: 0 }),
    kit.sphere(0.03, at(0.34, 0.07, 0.23), 'white', { detail: 0 }),
    kit.sphere(0.03, at(0.34, -0.07, 0.23), 'white', { detail: 0 }),
    kit.sphere(0.016, at(0.365, 0.075, 0.23), 'charcoal', { detail: 0 }),
    kit.sphere(0.016, at(0.365, -0.075, 0.23), 'charcoal', { detail: 0 }),
    kit.sphere(0.04, at(0.23, 0.1, 0.3), fur, { detail: 0 }),
    kit.sphere(0.04, at(0.23, -0.1, 0.3), fur, { detail: 0 }),
    // front paws stretched forward, tail curling behind
    kit.sphere(0.05, at(0.3, 0.08, 0.04), fur, { detail: 0, scale: [1.6, 0.8, 0.9], rotate: rot }),
    kit.sphere(0.05, at(0.3, -0.08, 0.04), fur, { detail: 0, scale: [1.6, 0.8, 0.9], rotate: rot }),
    rod(kit, at(-0.3, 0, 0.1), at(-0.5, 0.08, 0.07), 0.018, fur, { segments: 4 }),
    kit.sphere(0.04, at(-0.52, 0.09, 0.07), lion ? 'woodDark' : 'wood', { detail: 0 }),
  ];
  if (lion) {
    // a fluffy mane ringing the head from behind, built from overlapping balls
    parts.push(
      kit.sphere(0.23, at(0.18, 0, 0.21), 'wood', { scale: [0.8, 1, 1.05], rotate: rot }),
      kit.sphere(0.15, at(0.16, 0.14, 0.12), 'wood', { detail: 0 }),
      kit.sphere(0.15, at(0.16, -0.14, 0.12), 'wood', { detail: 0 }),
      kit.sphere(0.13, at(0.18, 0, 0.36), 'woodDark', { detail: 0 }),
    );
  }
  return parts;
}

/** โขดหินสิงโต: a flat sunning rock on grass with a lounging lion and a lioness. */
export const item: ItemModel = {
  id: 'lion-rock',
  name: 'โขดหินสิงโต',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.96, GROUND_H, 1.96], [0, GROUND_H / 2, 0], 'lime'),
      // the rock: a wide flat slab on a chunky base, with boulders round its feet
      kit.box([1.0, ROCK.top - GROUND_H - 0.12, 0.9], [ROCK.x, GROUND_H + (ROCK.top - GROUND_H - 0.12) / 2, ROCK.z], 'stoneDark'),
      kit.box([1.2, 0.12, 1.05], [ROCK.x + 0.03, ROCK.top - 0.06, ROCK.z], 'stone'),
      kit.sphere(0.14, [ROCK.x + 0.63, ROCK.top - 0.06, ROCK.z + 0.5], 'stone', { detail: 0, scale: [1, 0.6, 1] }),
      kit.sphere(0.14, [ROCK.x + 0.63, ROCK.top - 0.06, ROCK.z - 0.5], 'stone', { detail: 0, scale: [1, 0.6, 1] }),
      kit.sphere(0.14, [ROCK.x - 0.57, ROCK.top - 0.06, ROCK.z + 0.5], 'stone', { detail: 0, scale: [1, 0.6, 1] }),
      kit.sphere(0.14, [ROCK.x - 0.57, ROCK.top - 0.06, ROCK.z - 0.5], 'stone', { detail: 0, scale: [1, 0.6, 1] }),
      kit.sphere(0.26, [-0.7, 0.16, -0.55], 'stone', { detail: 0, scale: [1.2, 0.7, 1.1] }),
      kit.sphere(0.2, [-0.55, 0.12, 0.42], 'stoneDark', { detail: 0, scale: [1.2, 0.7, 1] }),
      kit.sphere(0.18, [0.38, 0.11, -0.78], 'stone', { detail: 0, scale: [1.2, 0.7, 1] }),
      kit.sphere(0.12, [0.55, 0.075, 0.1], 'stoneDark', { detail: 0, scale: [1.2, 0.7, 1] }),
      // grass tufts
      kit.cone(0.05, 0.14, [0.8, GROUND_H + 0.07, -0.3], 'leaf', { segments: 5 }),
      kit.cone(0.04, 0.11, [0.86, GROUND_H + 0.055, -0.22], 'leafDark', { segments: 5 }),
      kit.cone(0.05, 0.13, [-0.85, GROUND_H + 0.065, 0.85], 'leaf', { segments: 5 }),
      ...lyingCat(kit, ROCK.x + 0.02, ROCK.top, ROCK.z - 0.05, 0.3, true),
      ...lyingCat(kit, 0.45, GROUND_H, 0.45, -0.9, false),
    ];
    return kit.finish(parts);
  },
};
