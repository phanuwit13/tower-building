import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Three deep-blue gridded solar panels on stands in a row along z, tilted towards the camera (+x).
const TILT = 0.5; // radians; the +x edge is the low one
const CHORD = 0.7;
const WIDTH = 0.62;
const PANEL_Y = 0.55;
const ROW_Z = [-0.66, 0, 0.66];

function at(cz: number, lx: number, ly: number, lz: number): [number, number, number] {
  const t = -TILT;
  return [lx * Math.cos(t) - ly * Math.sin(t), PANEL_Y + lx * Math.sin(t) + ly * Math.cos(t), cz + lz];
}

/** แถวแผงโซลาร์: three solar panels on stands. */
export const item: ItemModel = {
  id: 'solar-panel-row',
  name: 'แถวแผงโซลาร์',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const rot: [number, number, number] = [0, 0, -TILT];
    const parts: Part[] = [kit.box([0.4, 0.04, 1.94], [0, 0.02, 0], 'stoneDark')]; // shared skid
    for (const cz of ROW_Z) {
      parts.push(
        kit.box([CHORD, 0.05, WIDTH], at(cz, 0, 0, 0), 'white', { rotate: rot }),
        kit.box([CHORD - 0.08, 0.02, WIDTH - 0.08], at(cz, 0, 0.035, 0), 'navy', { rotate: rot }),
      );
      for (const lx of [-0.12, 0.12]) parts.push(kit.box([0.02, 0.012, WIDTH - 0.08], at(cz, lx, 0.051, 0), 'blue', { rotate: rot }));
      for (const lz of [-0.14, 0.14]) parts.push(kit.box([CHORD - 0.08, 0.012, 0.02], at(cz, 0, 0.051, lz), 'blue', { rotate: rot }));
      parts.push(kit.box([0.06, PANEL_Y - 0.02 - 0.04, 0.08], [0, 0.04 + (PANEL_Y - 0.06) / 2, cz], 'chrome'));
    }
    return kit.finish(parts);
  },
};
