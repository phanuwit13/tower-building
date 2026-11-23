import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A low arena (x ±0.97, z ±1.47) with a rim, six posts holding a roof grid, chase lights round the roof
// edge and five little cars that each turn slowly on the spot about their own centre.
const HX = 0.97;
const HZ = 1.47;
const FLOOR_H = 0.04;
const RIM = { h: 0.14, t: 0.06 };
const POST = { x: 0.88, z: 1.38, r: 0.045, top: 1.0 };
const BEAM = 0.07;
const ROOF_Y = 1.02; // centre of the grid beams
const BULBS = 24;
const BULB_Y = ROOF_Y + BEAM / 2 + 0.035;
/** Car centre x, z, colour, spin direction. Every car stays clear of the rim and the posts while turning. */
const CARS: Array<[number, number, PaletteColor, number]> = [
  [0.45, -0.95, 'red', 1], [-0.4, -0.5, 'sunYellow', -1], [0.4, 0.1, 'blue', 1], [-0.4, 0.55, 'pink', -1], [0.4, 1.0, 'leaf', 1],
];

/** A point `s` along the roof-edge rectangle (x ±POST.x, z ±POST.z), starting at (+x, -z) and running towards +z. */
function onRoofEdge(s: number): [number, number] {
  const lx = 2 * POST.x;
  const lz = 2 * POST.z;
  if (s < lz) return [POST.x, -POST.z + s];
  if (s < lz + lx) return [POST.x - (s - lz), POST.z];
  if (s < 2 * lz + lx) return [-POST.x, POST.z - (s - lz - lx)];
  return [-POST.x + (s - 2 * lz - lx), -POST.z];
}

/** รถบั๊มพ์: a bumper-car arena with a grid roof, running lights on its edge and cars turning on the spot. */
export const item: ItemModel = {
  id: 'bumper-cars',
  name: 'รถบั๊มพ์',
  category: 'ride',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [kit.box([2 * HX, FLOOR_H, 2 * HZ], [0, FLOOR_H / 2, 0], 'stoneDark')];
    const rimY = FLOOR_H + RIM.h / 2;
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([2 * HX, RIM.h, RIM.t], [0, rimY, s * (HZ - RIM.t / 2)], 'red'),
        kit.box([RIM.t, RIM.h, 2 * HZ - 2 * RIM.t], [s * (HX - RIM.t / 2), rimY, 0], 'red'),
      );
    }
    for (const x of [-POST.x, POST.x]) {
      for (const z of [-POST.z, 0, POST.z]) {
        parts.push(kit.cylinder(POST.r, POST.r, POST.top - FLOOR_H, [x, (FLOOR_H + POST.top) / 2, z], 'sunYellow', { segments: 8 }));
      }
    }
    // roof grid
    for (const x of [-POST.x, 0, POST.x]) parts.push(kit.box([BEAM, BEAM, 2 * POST.z + BEAM], [x, ROOF_Y, 0], x === 0 ? 'charcoal' : 'blue'));
    for (const z of [-POST.z, -POST.z / 2, 0, POST.z / 2, POST.z]) {
      parts.push(kit.box([2 * POST.x + BEAM, BEAM, BEAM], [0, ROOF_Y, z], Math.abs(z) === POST.z ? 'blue' : 'charcoal'));
    }
    const perimeter = 4 * POST.x + 4 * POST.z;
    for (let index = 0; index < BULBS; index++) {
      const [x, z] = onRoofEdge((index / BULBS) * perimeter);
      parts.push(kit.sphere(0.035, [x, BULB_Y, z], 'lampWarm', { detail: 0, glow: true, light: 'chase', chase: { index, count: BULBS } }));
    }
    // cars: each one turns about its own centre
    for (const [cx, cz, color, dir] of CARS) {
      const spin: MotionOpts = { kind: 'spin', pivot: [cx, 0, cz], axis: [0, 1, 0], speed: 0.4 * dir };
      const at = (x: number, y: number, z: number): [number, number, number] => [cx + x, y, cz + z];
      parts.push(
        kit.box([0.36, 0.05, 0.26], at(0, FLOOR_H + 0.025, 0), 'charcoal', { motion: spin }),
        kit.box([0.32, 0.1, 0.24], at(0, FLOOR_H + 0.1, 0), color, { motion: spin }),
        kit.box([0.04, 0.06, 0.3], at(0.19, FLOOR_H + 0.06, 0), 'stone', { motion: spin }),
        kit.box([0.04, 0.06, 0.3], at(-0.19, FLOOR_H + 0.06, 0), 'stone', { motion: spin }),
        kit.box([0.16, 0.08, 0.2], at(-0.06, FLOOR_H + 0.19, 0), 'white', { motion: spin }),
        kit.sphere(0.055, at(-0.06, FLOOR_H + 0.28, 0), 'sand', { detail: 0, motion: spin }),
      );
    }
    return kit.finish(parts);
  },
};
