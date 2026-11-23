import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// 2×3. A lake corner with a little wooden jetty on the -x shore and three swan-shaped pedal boats.
const SHORE_TOP = 0.04;
const WATER_TOP = 0.05;
const LAKE = { w: 1.64, d: 2.7, cx: 0.14 };
const POND: MotionOpts = { kind: 'water', water: 'pond' };
const JETTY = { x0: -0.94, x1: -0.35, z: -0.95, w: 0.4, deck: 0.13 };
/** Boats: [x, z, yaw, hull colour]. */
const BOATS: Array<[number, number, number, PaletteColor]> = [
  [0.28, -0.55, 0.25, 'pink'], [0.32, 0.4, -0.2, 'sunYellow'], [0.1, 1.0, 0.1, 'blue'],
];

/** A swan-shaped pedal boat facing `yaw` (0 = +x): a colourful hull, white wings, a tall white neck and head, an orange beak. */
function swanBoat(kit: StyleKit, x: number, z: number, yaw: number, hull: PaletteColor): Part[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const at = (f: number, side: number, up: number): Vec3 => [x + f * c + side * s, WATER_TOP + up, z - f * s + side * c];
  const rotate: Vec3 = [0, yaw, 0];
  return [
    kit.sphere(0.3, at(0, 0, 0.1), hull, { scale: [1.35, 0.5, 0.78], rotate }),
    kit.box([0.34, 0.03, 0.34], at(-0.05, 0, 0.215), 'white', { rotate }), // deck
    // wings folded along the sides, tail up at the back
    kit.sphere(0.2, at(-0.06, 0.2, 0.2), 'white', { detail: 0, scale: [1.3, 0.55, 0.5], rotate: [0, yaw, 0.1] }),
    kit.sphere(0.2, at(-0.06, -0.2, 0.2), 'white', { detail: 0, scale: [1.3, 0.55, 0.5], rotate: [0, yaw, 0.1] }),
    kit.cone(0.1, 0.22, at(-0.42, 0, 0.27), 'white', { segments: 6, rotate: [0, yaw, 1.1], scale: [1, 1, 1.6] }),
    // neck rises in an S from the bow, then the head and beak
    rod(kit, at(0.3, 0, 0.18), at(0.4, 0, 0.42), 0.055, 'white', { segments: 6 }),
    rod(kit, at(0.4, 0, 0.42), at(0.38, 0, 0.62), 0.05, 'white', { segments: 6 }),
    kit.sphere(0.085, at(0.43, 0, 0.7), 'white', { detail: 0 }),
    kit.cone(0.035, 0.12, at(0.54, 0, 0.68), 'orange', { segments: 6, rotate: [0, yaw, -Math.PI / 2] }),
    kit.sphere(0.017, at(0.46, 0.055, 0.73), 'charcoal', { detail: 0 }),
    kit.sphere(0.017, at(0.46, -0.055, 0.73), 'charcoal', { detail: 0 }),
    // pedal seat
    kit.box([0.12, 0.04, 0.26], at(-0.18, 0, 0.26), hull, { rotate }),
  ];
}

/** ทะเลสาบเรือเป็ดถีบ: a lake corner with a jetty and three swan pedal boats. */
export const item: ItemModel = {
  id: 'swan-boat-lake',
  name: 'ทะเลสาบเรือเป็ดถีบ',
  category: 'ride',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.98, 0.03, 2.98], [0, 0.015, 0], 'lime'),
      kit.box([1.96, SHORE_TOP, 2.96], [0, SHORE_TOP / 2, 0], 'sand'),
      kit.box([LAKE.w, WATER_TOP, LAKE.d], [LAKE.cx, WATER_TOP / 2, 0], 'navy', { motion: POND }),
    ];
    // jetty: deck planks on posts, reaching out from the -x shore
    const jl = JETTY.x1 - JETTY.x0;
    const jx = (JETTY.x0 + JETTY.x1) / 2;
    parts.push(kit.box([jl, 0.04, JETTY.w], [jx, JETTY.deck, JETTY.z], 'wood'));
    for (let k = 0; k < 6; k++) {
      parts.push(kit.box([0.012, 0.012, JETTY.w + 0.02], [JETTY.x0 + 0.1 + k * 0.1, JETTY.deck + 0.026, JETTY.z], 'woodDark'));
    }
    for (const px of [JETTY.x0 + 0.08, JETTY.x1 - 0.08]) {
      for (const dz of [-1, 1]) {
        parts.push(kit.cylinder(0.04, 0.04, JETTY.deck + 0.12, [px, (JETTY.deck + 0.12) / 2, JETTY.z + dz * (JETTY.w / 2 - 0.03)], 'woodDark', { segments: 6 }));
      }
    }
    // a rope-and-post at the jetty end, and a lifebuoy-coloured ring
    parts.push(kit.torus(0.07, 0.025, [JETTY.x1 - 0.1, JETTY.deck + 0.12, JETTY.z + JETTY.w / 2 - 0.01], 'red', { radialSegments: 4, tubularSegments: 12 }));
    for (const [x, z, h] of [[0.95, -1.38, 0.4], [0.88, -1.3, 0.32], [-0.95, 1.38, 0.38], [-0.88, 1.3, 0.3]] as Array<[number, number, number]>) {
      parts.push(
        kit.cylinder(0.014, 0.022, h, [x, SHORE_TOP + h / 2, z], 'leaf', { segments: 4 }),
        kit.cylinder(0.026, 0.026, 0.09, [x, SHORE_TOP + h + 0.015, z], 'bark', { segments: 6 }),
      );
    }
    parts.push(
      kit.sphere(0.13, [-0.8, 0.12, 0.7], 'stoneDark', { detail: 0, scale: [1.2, 0.7, 1] }),
      kit.sphere(0.08, [-0.76, 0.09, 0.82], 'stone', { detail: 0, scale: [1.2, 0.7, 1] }),
      kit.sphere(0.2, [-0.72, 0.2, 1.22], 'leaf', { detail: 0, scale: [1.2, 0.8, 1] }),
      kit.sphere(0.14, [0.8, 0.14, -1.3], 'leafDark', { detail: 0 }),
    );
    for (const [x, z, h, c] of [[0.92, 0.2, 0.22, 'pink'], [0.9, 0.3, 0.17, 'sunYellow'], [-0.92, -0.1, 0.2, 'purple']] as Array<[number, number, number, PaletteColor]>) {
      parts.push(kit.cylinder(0.012, 0.014, h, [x, SHORE_TOP + h / 2, z], 'leaf', { segments: 4 }), kit.sphere(0.05, [x, SHORE_TOP + h + 0.02, z], c, { detail: 0 }));
    }
    for (const [x, z, yaw, hull] of BOATS) parts.push(...swanBoat(kit, x, z, yaw, hull));
    return kit.finish(parts);
  },
};
