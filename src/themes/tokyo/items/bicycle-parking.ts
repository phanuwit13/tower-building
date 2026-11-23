import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

// A bicycle park: a low pad, a steel rail along each side and a row of four colourful bikes parked
// nose to +x, with a lit lamp at each end.
const PAD = 0.03;
const WR = { r: 0.15, tube: 0.025 };
const HUB_Y = PAD + WR.r + WR.tube;
const AXLE_X = 0.26;

/** One bike in a frame colour at height z. Wheels in the x-y plane, front wheel at +x. */
function bike(kit: StyleKit, z: number, color: PaletteColor, basket: boolean): Part[] {
  const p = (x: number, y: number): [number, number, number] => [x, y, z];
  const tyre = (x: number): Part => kit.torus(WR.r, WR.tube, p(x, HUB_Y), 'charcoal', { radialSegments: 4, tubularSegments: 8 });
  const parts: Part[] = [
    tyre(AXLE_X),
    tyre(-AXLE_X),
    rod(kit, p(-AXLE_X, HUB_Y), p(-0.06, 0.34), 0.022, color, { segments: 4 }),
    rod(kit, p(-0.06, 0.34), p(0.15, 0.36), 0.022, color, { segments: 4 }),
    rod(kit, p(-0.06, 0.34), p(0.04, HUB_Y), 0.022, color, { segments: 4 }),
    rod(kit, p(0.15, 0.36), p(AXLE_X, HUB_Y), 0.022, color, { segments: 4 }),
    kit.box([0.04, 0.03, 0.18], p(0.14, 0.46), 'chrome'), // handlebar
    kit.box([0.14, 0.035, 0.07], p(-0.08, 0.4), 'charcoal'), // saddle
    kit.sphere(0.035, p(0.2, 0.46), 'lampWarm', { detail: 0, glow: true }),
  ];
  if (basket) parts.push(kit.box([0.1, 0.08, 0.14], p(0.22, 0.45), 'wood'));
  return parts;
}

/** ที่จอดจักรยาน: a rack with a row of colourful bicycles. */
export const item: ItemModel = {
  id: 'bicycle-parking',
  name: 'ที่จอดจักรยาน',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.9, PAD, 1.94], [0, PAD / 2, 0], 'stone')];
    for (const x of [-0.2, 0.2]) {
      parts.push(kit.box([0.04, 0.04, 1.84], [x, PAD + 0.1, 0], 'chrome'));
      for (const z of [-0.9, 0, 0.9]) parts.push(kit.box([0.04, 0.1, 0.04], [x, PAD + 0.05, z], 'charcoal'));
    }
    parts.push(...bike(kit, -0.69, 'pink', true), ...bike(kit, -0.23, 'skyBlue', false), ...bike(kit, 0.23, 'sunYellow', true), ...bike(kit, 0.69, 'lime', false));
    // lamp posts at the ends
    for (const z of [-0.93, 0.93]) {
      parts.push(kit.cylinder(0.02, 0.025, 0.55, [-0.4, PAD + 0.275, z], 'navy', { segments: 6 }), kit.sphere(0.055, [-0.4, PAD + 0.6, z], 'lampWarm', { glow: true, detail: 0 }));
    }
    return kit.finish(parts);
  },
};
