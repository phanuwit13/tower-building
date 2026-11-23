import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod, wheel } from '../../../models/parts';

// A city bike with a front basket, nose to +x, held up by its centre stand.
const WR = { r: 0.17, tube: 0.025 };
const HUB = WR.r + WR.tube;
const AX = 0.27;

/** จักรยานจอด: a city bike with a front basket on its stand. */
export const item: ItemModel = {
  id: 'parked-bike',
  name: 'จักรยานจอด',
  category: 'vehicle',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const p = (x: number, y: number, z = 0): [number, number, number] => [x, y, z];
    const parts: Part[] = [
      ...wheel(kit, { at: p(AX, HUB), radius: WR.r, tube: WR.tube, axis: 'z', color: 'charcoal', spokes: 1, tubularSegments: 12 }),
      ...wheel(kit, { at: p(-AX, HUB), radius: WR.r, tube: WR.tube, axis: 'z', color: 'charcoal', spokes: 1, tubularSegments: 12 }),
      // step-through frame in teal
      rod(kit, p(-AX, HUB), p(-0.1, 0.4), 0.022, 'teal', { segments: 4 }), // chain stay to the seat
      rod(kit, p(-0.1, 0.4), p(-0.04, 0.22), 0.022, 'teal', { segments: 4 }), // seat tube
      rod(kit, p(-0.04, 0.22), p(0.14, 0.32), 0.022, 'teal', { segments: 4 }), // low down tube
      rod(kit, p(0.14, 0.32), p(0.16, 0.5), 0.022, 'teal', { segments: 4 }), // head tube
      rod(kit, p(0.16, 0.5), p(AX, HUB), 0.02, 'chrome', { segments: 4 }), // fork
      rod(kit, p(0.16, 0.5), p(0.12, 0.58), 0.018, 'chrome', { segments: 4 }), // stem
      kit.box([0.04, 0.03, 0.26], p(0.12, 0.59), 'chrome'), // handlebar
      kit.sphere(0.025, p(0.12, 0.59, 0.14), 'charcoal', { detail: 0 }),
      kit.sphere(0.025, p(0.12, 0.59, -0.14), 'charcoal', { detail: 0 }),
      kit.box([0.18, 0.04, 0.09], p(-0.12, 0.45), 'wood'), // saddle
      rod(kit, p(-0.1, 0.4), p(-0.12, 0.45), 0.02, 'chrome', { segments: 4 }),
      // front basket: floor and four walls, with a sunYellow rim
      kit.box([0.2, 0.025, 0.26], p(0.35, 0.52), 'woodDark'),
      kit.box([0.02, 0.13, 0.26], p(0.44, 0.585), 'wood'),
      kit.box([0.02, 0.13, 0.26], p(0.26, 0.585), 'wood'),
      kit.box([0.2, 0.13, 0.02], p(0.35, 0.585, 0.12), 'wood'),
      kit.box([0.2, 0.13, 0.02], p(0.35, 0.585, -0.12), 'wood'),
      rod(kit, p(0.16, 0.5), p(0.28, 0.52), 0.016, 'chrome', { segments: 4 }),
      kit.sphere(0.04, p(0.2, 0.43), 'lampWarm', { detail: 0, glow: true }), // front lamp
      kit.sphere(0.03, p(-0.22, 0.42), 'red', { detail: 0, glow: true }), // rear reflector
      ...[[0.26, 0.12], [0.26, -0.12], [0.44, 0.12], [0.44, -0.12]].map(([x, z]) => kit.sphere(0.025, p(x!, 0.66, z), 'lampWarm', { detail: 0, glow: true })), // basket fairy lights
      // centre stand, two legs behind the rear hub
      rod(kit, p(-0.2, 0.2, 0.06), p(-0.3, 0.025, 0.06), 0.018, 'stoneDark', { segments: 4 }),
      rod(kit, p(-0.2, 0.2, -0.06), p(-0.3, 0.025, -0.06), 0.018, 'stoneDark', { segments: 4 }),
    ];
    return kit.finish(parts);
  },
};
