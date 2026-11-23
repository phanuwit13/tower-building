import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { ICO_LOW, rod } from '../../../models/parts';

// A round shallow pond on a sandy shore, ringed by low rocks, with four pink flamingos wading (two stand on one leg).
const SHORE = { r: 0.97, h: 0.025 };
const WATER = { rx: 0.76, rz: 0.76, y0: 0.02, top: 0.07 }; // navy: night light is blue, pale water would glare
const RING = 0.82;
const ROCK_SQUASH = 0.55;
/** Rim rocks in order round the pond: [size, colour]. */
const ROCKS: Array<[number, PaletteColor]> = [
  [0.11, 'stone'], [0.09, 'stoneDark'], [0.12, 'stone'], [0.1, 'stone'], [0.09, 'stoneDark'],
  [0.12, 'stone'], [0.1, 'stone'], [0.11, 'stoneDark'], [0.1, 'stone'], [0.09, 'stoneDark'],
];
const POND: MotionOpts = { kind: 'water', water: 'pond' };
/** Flamingos: [x, z, yaw, one leg?]. */
const BIRDS: Array<[number, number, number, boolean]> = [
  [0.22, 0.28, 0.4, true], [-0.28, 0.32, 2.5, false], [0.05, -0.35, 5.2, true], [-0.35, -0.3, 3.9, false],
];
const LEG = { len: 0.4, r: 0.016 };
/** Reeds on the back rim: [x, z, height]. */
const REEDS: Array<[number, number, number]> = [[-0.6, -0.55, 0.42], [-0.68, -0.4, 0.32]];

/** A flamingo standing in the water, turned by `yaw` about y (0 faces +x). */
function flamingo(kit: StyleKit, x: number, z: number, yaw: number, oneLeg: boolean): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  /** Local (forward, side, up) to world. */
  const at = (f: number, side: number, up: number): Vec3 => [x + f * c + side * s, WATER.top + up, z - f * s + side * c];
  const rotate: Vec3 = [0, yaw, 0];
  const body = LEG.len + 0.05;
  const parts: Part[] = [
    kit.sphere(0.15, at(0, 0, body + 0.07), 'pink', { detail: 0, scale: [1.3, 0.85, 0.8], rotate }),
    kit.sphere(0.09, at(-0.16, 0, body + 0.08), 'pink', { detail: 0, scale: [1.2, 0.7, 0.7], rotate: [0, yaw, 0.3] }), // tail end
    kit.box([0.17, 0.05, 0.03], at(-0.04, 0.1, body + 0.1), 'red', { rotate }), // wing tint
    kit.box([0.17, 0.05, 0.03], at(-0.04, -0.1, body + 0.1), 'red', { rotate }),
    // the S-shaped neck, then a round head with a bent beak and big eyes
    rod(kit, at(0.12, 0, body + 0.1), at(0.2, 0, body + 0.3), 0.032, 'pink', { segments: 4 }),
    rod(kit, at(0.2, 0, body + 0.3), at(0.14, 0, body + 0.46), 0.03, 'pink', { segments: 4 }),
    kit.sphere(0.056, at(0.15, 0, body + 0.5), 'pink', { detail: 0 }),
    kit.box([0.07, 0.035, 0.04], at(0.22, 0, body + 0.48), 'orange', { rotate: [0, yaw, -0.3] }),
    kit.box([0.03, 0.03, 0.04], at(0.26, 0, body + 0.455), 'charcoal', { rotate: [0, yaw, -0.6] }),
    kit.box([0.02, 0.035, 0.035], at(0.195, 0.045, body + 0.52), 'charcoal', { rotate }), // big dark eyes
    kit.box([0.02, 0.035, 0.035], at(0.195, -0.045, body + 0.52), 'charcoal', { rotate }),
  ];
  // legs: knee joint then foot; the second leg is folded up under the body when the bird stands on one leg
  parts.push(rod(kit, at(0, 0.04, body), at(0.01, 0.04, 0), LEG.r, 'pink', { segments: 4 }));
  if (oneLeg) {
    parts.push(rod(kit, at(0.0, -0.04, body), at(0.06, -0.04, body - 0.1), LEG.r, 'pink', { segments: 4 }));
    parts.push(rod(kit, at(0.06, -0.04, body - 0.1), at(-0.03, -0.04, body - 0.13), LEG.r, 'pink', { segments: 4 }));
  } else {
    parts.push(rod(kit, at(0, -0.04, body), at(0.01, -0.04, 0), LEG.r, 'pink', { segments: 4 }));
  }
  return parts;
}

/** บ่อนกฟลามิงโก: a round shallow pond with four pink flamingos, two of them on one leg. */
export const item: ItemModel = {
  id: 'flamingo-pond',
  name: 'บ่อนกฟลามิงโก',
  category: 'animal',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(SHORE.r, SHORE.r, SHORE.h, [0, SHORE.h / 2, 0], 'sand', { segments: 16 }),
      kit.cylinder(1, 1, WATER.top - WATER.y0, [0, (WATER.top + WATER.y0) / 2, 0], 'navy', { segments: 16, scale: [WATER.rx, 1, WATER.rz], motion: POND }),
    ];
    ROCKS.forEach(([size, color], k) => {
      const a = (k / ROCKS.length) * Math.PI * 2;
      parts.push(kit.sphere(size, [RING * Math.cos(a), size * ROCK_SQUASH * ICO_LOW, RING * Math.sin(a)], color,
        { detail: 0, scale: [1.3, ROCK_SQUASH, 1.15], rotate: [0, -a, 0] }));
    });
    for (const [x, z, h] of REEDS) {
      parts.push(
        kit.cylinder(0.014, 0.02, h, [x, h / 2 + SHORE.h, z], 'leaf', { segments: 4 }),
        kit.cylinder(0.03, 0.03, 0.09, [x, h + SHORE.h, z], 'bark', { segments: 4 }),
      );
    }
    for (const [x, z, yaw, oneLeg] of BIRDS) parts.push(...flamingo(kit, x, z, yaw, oneLeg));
    return kit.finish(parts);
  },
};
