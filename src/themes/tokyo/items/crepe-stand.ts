import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { glassWindow } from '../../../models/parts';

// A pastel kiosk: mint walls, a pink roof, a striped awning, lit windows and a giant crepe cone on the roof
// with cream, strawberries and chocolate. The windows glow at night (animation "window").
const TOP = 0.62;
const ROOF_Y = 1.0;

/** ร้านเครป: a pastel crepe stand with a giant crepe on top. */
export const item: ItemModel = {
  id: 'crepe-stand',
  name: 'ร้านเครป',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.74, ROOF_Y - 0.04, 1.5], [-0.05, (ROOF_Y - 0.04) / 2, 0], 'mint'),
      kit.box([0.76, 0.1, 1.52], [-0.05, 0.05, 0], 'white'),
      kit.box([0.84, 0.06, 1.6], [-0.05, ROOF_Y - 0.01, 0], 'pink'),
      kit.box([0.14, 0.04, 1.3], [0.42, TOP - 0.02, 0], 'pink'),
      kit.box([0.08, 0.3, 1.3], [0.34, 0.45, 0], 'white'),
    ];
    // awning: pink and white strips slanting out over the counter
    for (let i = 0; i < 6; i++) {
      parts.push(kit.box([0.2, 0.03, 0.22], [0.38, 0.96, (i - 2.5) * 0.22], i % 2 ? 'white' : 'pink', { rotate: [0, 0, -0.45] }));
    }
    // windows, lit at night
    parts.push(
      ...glassWindow(kit, { at: [0.32, 0.8, 0], facing: 'x+', w: 0.9, h: 0.22, frame: 'pink', panes: 3 }),
      ...glassWindow(kit, { at: [-0.05, 0.6, 0.75], facing: 'z+', w: 0.4, h: 0.3, frame: 'pink' }),
      ...glassWindow(kit, { at: [-0.05, 0.6, -0.75], facing: 'z-', w: 0.4, h: 0.3, frame: 'pink' }),
    );
    // on the counter: a plate of crepes and a cup of cream
    parts.push(
      kit.cylinder(0.1, 0.1, 0.02, [0.37, TOP + 0.01, -0.4], 'white', { segments: 8 }),
      kit.cylinder(0.08, 0.08, 0.05, [0.37, TOP + 0.045, -0.4], 'sand', { segments: 8 }),
      kit.sphere(0.04, [0.37, TOP + 0.1, -0.4], 'red', { detail: 0 }),
      kit.cylinder(0.06, 0.04, 0.1, [0.42, TOP + 0.07, 0.35], 'sunYellow', { segments: 8 }),
    );
    // giant crepe: a waffle-coloured cone with cream, strawberries and chocolate
    const cx = -0.05;
    const ctop = ROOF_Y + 0.02 + 0.44;
    parts.push(
      kit.cylinder(0.3, 0.06, 0.44, [cx, ROOF_Y + 0.02 + 0.22, 0], 'sand', { segments: 8 }),
      kit.cylinder(0.32, 0.32, 0.04, [cx, ctop, 0], 'orange', { segments: 8 }),
      kit.dome(0.26, [cx, ctop + 0.02, 0], 'white', { segments: 8, scale: [1, 0.8, 1] }),
      kit.sphere(0.07, [cx + 0.1, ctop + 0.2, 0.04], 'red', { detail: 0 }),
      kit.sphere(0.07, [cx - 0.08, ctop + 0.19, -0.06], 'red', { detail: 0 }),
      kit.sphere(0.05, [cx, ctop + 0.24, 0.1], 'pink', { detail: 0 }),
      kit.torus(0.24, 0.022, [cx, ctop + 0.05, 0], 'bark', { radialSegments: 4, tubularSegments: 12, rotate: [Math.PI / 2, 0, 0] }),
    );
    return kit.finish(parts);
  },
};
