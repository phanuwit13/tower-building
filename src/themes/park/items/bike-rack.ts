import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

const BASE = 0.03;
const WHEEL = { r: 0.14, tube: 0.02 };
const HUB_Y = WHEEL.r + WHEEL.tube + BASE; // wheels rest on the pad
const REAR_X = -0.2;
const FRONT_X = 0.2;

/** A small bike standing along x (front wheel at +x), at lane z, on the pad at y = BASE. */
function bike(kit: StyleKit, z: number, frame: PaletteColor): Part[] {
  const y = HUB_Y;
  const seat: [number, number] = [-0.08, y + 0.24];
  const bb: [number, number] = [0, y + 0.01];
  const head: [number, number] = [0.14, y + 0.23];
  const p = (xy: [number, number]): [number, number, number] => [xy[0], xy[1], z];
  return [
    kit.torus(WHEEL.r, WHEEL.tube, [REAR_X, y, z], 'charcoal', { radialSegments: 4, tubularSegments: 8 }),
    kit.torus(WHEEL.r, WHEEL.tube, [FRONT_X, y, z], 'charcoal', { radialSegments: 4, tubularSegments: 8 }),
    rod(kit, p([REAR_X, y]), p(bb), 0.016, frame, { segments: 4 }),
    rod(kit, p(bb), p(seat), 0.016, frame, { segments: 4 }),
    rod(kit, p(seat), p(head), 0.016, frame, { segments: 4 }),
    rod(kit, p(bb), p(head), 0.016, frame, { segments: 4 }),
    rod(kit, p(head), p([FRONT_X, y]), 0.016, 'chrome', { segments: 4 }),
    rod(kit, p(seat), p([-0.1, y + 0.3]), 0.014, 'chrome', { segments: 4 }),
    kit.box([0.12, 0.03, 0.07], [-0.1, y + 0.32, z], 'charcoal'),
    kit.box([0.03, 0.02, 0.17], [0.16, y + 0.29, z], 'charcoal'), // handlebar
  ];
}

/** ที่จอดจักรยาน: a rack of steel hoops with two parked bikes. */
export const item: ItemModel = {
  id: 'bike-rack',
  name: 'ที่จอดจักรยาน',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.96, BASE, 1.96], [0, BASE / 2, 0], 'stone')];
    // three hoops standing across the front wheels, between and beside the bikes
    for (const z of [-0.62, 0, 0.62]) {
      parts.push(
        kit.torus(0.13, 0.02, [0.3, BASE + 0.02, z], 'stoneDark', {
          radialSegments: 4,
          tubularSegments: 8,
          arc: Math.PI,
          rotate: [0, Math.PI / 2, 0],
        }),
      );
    }
    parts.push(...bike(kit, -0.31, 'red'), ...bike(kit, 0.31, 'sunYellow'));
    return kit.finish(parts);
  },
};
