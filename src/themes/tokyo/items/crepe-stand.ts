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
    // giant crepe: a rolled, wrapped cone tilted towards the camera (+x), filled with cream and strawberries
    const TILT = 0.6;
    const dir = [Math.sin(TILT), Math.cos(TILT)] as const;
    const tip = [-0.15, ROOF_Y + 0.04] as const;
    const at = (t: number): [number, number, number] => [tip[0] + dir[0] * t, tip[1] + dir[1] * t, 0];
    const rot: [number, number, number] = [0, 0, -TILT];
    parts.push(
      kit.cylinder(0.17, 0.03, 0.5, at(0.25), 'sand', { segments: 8, rotate: rot }),
      kit.cylinder(0.18, 0.15, 0.1, at(0.45), 'orange', { segments: 8, rotate: rot }),
      kit.sphere(0.16, at(0.55), 'white', { detail: 1, scale: [1, 0.85, 1] }),
      kit.sphere(0.065, [at(0.6)[0] + 0.07, at(0.6)[1] + 0.1, 0.05], 'red', { detail: 0 }),
      kit.sphere(0.065, [at(0.6)[0] - 0.05, at(0.6)[1] + 0.12, -0.06], 'red', { detail: 0 }),
      kit.sphere(0.04, [at(0.6)[0] + 0.02, at(0.6)[1] + 0.16, 0.08], 'pink', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
