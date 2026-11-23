import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod, wheel } from '../../../models/parts';

// A low stone pad with two rails and three colourful bikes parked side by side (nose to +x).
const PAD = 0.03;
const WR = { r: 0.16, tube: 0.025 }; // wheel
const HUB_Y = PAD + WR.r + WR.tube;
const AXLE_X = 0.27;

/** One bike in a frame colour at height z. Wheels in the x-y plane, front wheel at +x. */
function bike(kit: StyleKit, z: number, color: PaletteColor): Part[] {
  const p = (x: number, y: number): [number, number, number] => [x, y, z];
  const parts: Part[] = [
    ...wheel(kit, { at: p(AXLE_X, HUB_Y), radius: WR.r, tube: WR.tube, axis: 'z', color: 'charcoal', spokes: 1, tubularSegments: 8 }),
    ...wheel(kit, { at: p(-AXLE_X, HUB_Y), radius: WR.r, tube: WR.tube, axis: 'z', color: 'charcoal', spokes: 1, tubularSegments: 8 }),
    rod(kit, p(-AXLE_X, HUB_Y), p(-0.06, 0.34), 0.022, color, { segments: 4 }), // chain stay + seat tube
    rod(kit, p(-0.06, 0.34), p(0.15, 0.36), 0.022, color, { segments: 4 }), // top tube
    rod(kit, p(-0.06, 0.34), p(0.04, HUB_Y), 0.022, color, { segments: 4 }), // down tube
    rod(kit, p(0.15, 0.36), p(AXLE_X, HUB_Y), 0.022, color, { segments: 4 }), // fork
    rod(kit, p(0.15, 0.36), p(0.13, 0.46), 0.018, 'chrome', { segments: 4 }), // stem
    kit.box([0.04, 0.03, 0.2], p(0.13, 0.47), 'chrome'), // handlebar
    kit.box([0.14, 0.035, 0.07], p(-0.08, 0.4), 'charcoal'), // saddle
    kit.sphere(0.04, p(0.2, 0.48), 'lampWarm', { detail: 0, glow: true }), // front lamp
    kit.sphere(0.035, p(-0.17, 0.4), 'red', { detail: 0, glow: true }), // rear reflector
  ];
  return parts;
}

/** ที่จอดจักรยาน: a rack with three colourful bikes. */
export const item: ItemModel = {
  id: 'bike-rack',
  name: 'ที่จอดจักรยาน',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.9, PAD, 1.94], [0, PAD / 2, 0], 'stone')];
    for (const x of [-AXLE_X, AXLE_X]) {
      parts.push(kit.box([0.04, 0.04, 1.84], [x, PAD + 0.1, 0], 'teal', { glow: 'teal' }));
      for (const z of [-0.9, -0.3, 0.3, 0.9]) parts.push(kit.box([0.04, 0.1, 0.04], [x, PAD + 0.05, z], 'charcoal'));
    }
    // a lamp post at each end of the rack
    for (const z of [-0.93, 0.93]) {
      parts.push(kit.cylinder(0.02, 0.025, 0.6, [-0.42, PAD + 0.3, z], 'navy', { segments: 6 }), kit.sphere(0.06, [-0.42, PAD + 0.64, z], 'lampWarm', { glow: true, light: 'breathe' }));
    }
    parts.push(...bike(kit, -0.6, 'red'), ...bike(kit, 0, 'blue'), ...bike(kit, 0.6, 'sunYellow'));
    return kit.finish(parts);
  },
};
