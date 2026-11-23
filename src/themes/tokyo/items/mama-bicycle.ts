import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod, wheel } from '../../../models/parts';

// A step-through "mama" bicycle with a front basket of flowers, standing along z (nobody riding).
const R = 0.2;
const TUBE = 0.028;
const AX = { front: 0.27, rear: -0.27 };
const HEAD = [0, 0.52, 0.22] as const;
const BB = [0, 0.25, 0.0] as const; // bottom bracket

/** จักรยานแม่บ้าน: a step-through bicycle with a front basket. */
export const item: ItemModel = {
  id: 'mama-bicycle',
  name: 'จักรยานแม่บ้าน',
  category: 'vehicle',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      ...wheel(kit, { at: [0, R, AX.front], radius: R - TUBE, tube: TUBE, axis: 'x', color: 'charcoal', hubColor: 'chrome', spokes: 2, spokeColor: 'chrome' }),
      ...wheel(kit, { at: [0, R, AX.rear], radius: R - TUBE, tube: TUBE, axis: 'x', color: 'charcoal', hubColor: 'chrome', spokes: 2, spokeColor: 'chrome' }),
      // frame: fork, a low step-through tube, chain stay, seat post and stay
      rod(kit, [0, R, AX.front], [...HEAD], 0.022, 'pink', { segments: 6 }),
      rod(kit, [...HEAD], [...BB], 0.03, 'pink', { segments: 6 }),
      rod(kit, [...BB], [0, R, AX.rear], 0.022, 'pink', { segments: 6 }),
      rod(kit, [...BB], [0, 0.52, -0.1], 0.022, 'pink', { segments: 6 }),
      rod(kit, [0, 0.52, -0.1], [0, R, AX.rear], 0.02, 'pink', { segments: 6 }),
      // handlebar and grips, saddle
      rod(kit, [...HEAD], [0, 0.6, 0.2], 0.018, 'chrome', { segments: 4 }),
      kit.box([0.4, 0.025, 0.025], [0, 0.61, 0.2], 'chrome'),
      kit.box([0.06, 0.04, 0.05], [-0.2, 0.61, 0.2], 'charcoal'),
      kit.box([0.06, 0.04, 0.05], [0.2, 0.61, 0.2], 'charcoal'),
      kit.box([0.1, 0.045, 0.22], [0, 0.56, -0.12], 'charcoal'),
      // rear carrier and a kickstand
      kit.box([0.14, 0.02, 0.2], [0, 0.4, AX.rear - 0.02], 'chrome'),
      rod(kit, [0, 0.4, AX.rear - 0.02], [0, R, AX.rear], 0.012, 'chrome', { segments: 4 }),
      rod(kit, [0.05, 0.25, AX.rear + 0.08], [0.08, 0.02, AX.rear + 0.2], 0.012, 'chrome', { segments: 4 }),
      // front basket with flowers
      kit.box([0.3, 0.12, 0.2], [0, 0.55, 0.36], 'sunYellow'),
      kit.box([0.32, 0.025, 0.22], [0, 0.615, 0.36], 'orange'),
      kit.sphere(0.05, [-0.07, 0.65, 0.36], 'pink', { detail: 0 }),
      kit.sphere(0.05, [0.07, 0.66, 0.36], 'white', { detail: 0 }),
      kit.sphere(0.045, [0, 0.67, 0.42], 'purple', { detail: 0 }),
      kit.sphere(0.04, [0, 0.64, 0.38], 'leaf', { detail: 0 }),
    ];
    return kit.finish(parts);
  },
};
