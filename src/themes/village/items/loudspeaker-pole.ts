import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { aim, heading } from '../../../models/parts';

const POLE_H = 2.8;
const HORN_Y = 2.55;

/** หอกระจายข่าว: a tall pole with four grey horn loudspeakers pointing different ways. */
export const item: ItemModel = {
  id: 'loudspeaker-pole',
  name: 'หอกระจายข่าว',
  category: 'facility',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.4, 0.1, 0.4], [0, 0.05, 0], 'stone'),
      kit.cylinder(0.06, 0.08, POLE_H, [0, POLE_H / 2, 0], 'white', { segments: 8 }),
      kit.cylinder(0.085, 0.085, 0.12, [0, 0.6, 0], 'blue', { segments: 8 }),
      kit.cylinder(0.085, 0.085, 0.12, [0, 1.5, 0], 'blue', { segments: 8 }),
      kit.box([0.2, 0.26, 0.14], [0.12, 1.25, 0], 'stone'), // amplifier box
      kit.cylinder(0.1, 0.1, 0.1, [0, POLE_H + 0.05, 0], 'stoneDark', { segments: 8 }),
      kit.cylinder(0.1, 0.1, 0.08, [0, HORN_Y, 0], 'charcoal', { segments: 8 }), // horn mount
    ];
    // four horns around the top, each tilted a little down
    [0, 1, 2, 3].forEach((i) => {
      const yaw = (i * Math.PI) / 2 + 0.4;
      const dir = heading(yaw, -0.2);
      const mid: [number, number, number] = [dir[0] * 0.22, HORN_Y + dir[1] * 0.22, dir[2] * 0.22];
      parts.push(
        kit.cylinder(0.15, 0.05, 0.28, mid, i % 2 ? 'stoneDark' : 'chrome', { segments: 8, rotate: aim(dir) }),
        kit.cylinder(0.09, 0.09, 0.05, [dir[0] * 0.33, HORN_Y + dir[1] * 0.33, dir[2] * 0.33], 'stoneDark', { segments: 8, rotate: aim(dir) }),
      );
    });
    return kit.finish(parts);
  },
};
