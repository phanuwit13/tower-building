import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Two rows of three deep-blue gridded solar panels tilted towards the camera (+x), and a little control box.
const TILT = 0.5; // radians; the +x edge is the low one
const CHORD = 0.58; // panel length across the tilt (x, flat)
const WIDTH = 0.86; // panel width along z
const PANEL_Y = 0.5; // panel centre height
const ROWS_X = [-0.55, 0.1];
const COLS_Z = [-1.0, 0, 1.0];
const BOX = { x: 0.72, z: -1.1 };

/** Local panel point (lx, ly, lz) turned by the tilt about z, then moved to the panel centre. */
function at(cx: number, cz: number, lx: number, ly: number, lz: number): [number, number, number] {
  const t = -TILT;
  return [cx + lx * Math.cos(t) - ly * Math.sin(t), PANEL_Y + lx * Math.sin(t) + ly * Math.cos(t), cz + lz];
}

function panel(kit: Parameters<ItemModel['build']>[0], cx: number, cz: number): Part[] {
  const rot: [number, number, number] = [0, 0, -TILT];
  const parts: Part[] = [
    kit.box([CHORD, 0.05, WIDTH], at(cx, cz, 0, 0, 0), 'white', { rotate: rot }),
    kit.box([CHORD - 0.08, 0.02, WIDTH - 0.08], at(cx, cz, 0, 0.035, 0), 'navy', { rotate: rot }),
  ];
  for (const lx of [-0.1, 0.1]) parts.push(kit.box([0.02, 0.012, WIDTH - 0.08], at(cx, cz, lx, 0.051, 0), 'blue', { rotate: rot }));
  for (const lz of [-0.14, 0.14]) parts.push(kit.box([CHORD - 0.08, 0.012, 0.02], at(cx, cz, 0, 0.051, lz), 'blue', { rotate: rot }));
  for (const dz of [-0.28, 0.28]) {
    parts.push(kit.box([0.06, PANEL_Y - 0.02, 0.06], [cx, (PANEL_Y - 0.02) / 2, cz + dz], 'chrome'));
    parts.push(kit.box([0.34, 0.04, 0.08], [cx, 0.02, cz + dz], 'charcoal'));
  }
  return parts;
}

/** ฟาร์มแผงโซลาร์: rows of tilted solar panels with a little control box. */
export const item: ItemModel = {
  id: 'solar-farm',
  name: 'ฟาร์มแผงโซลาร์',
  category: 'facility',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const x of ROWS_X) for (const z of COLS_Z) parts.push(...panel(kit, x, z));
    // control box with a door panel, a lamp-less indicator and a little antenna
    parts.push(
      kit.box([0.42, 0.5, 0.5], [BOX.x, 0.25, BOX.z], 'white'),
      kit.box([0.48, 0.06, 0.56], [BOX.x, 0.53, BOX.z], 'orange'),
      kit.box([0.02, 0.3, 0.26], [BOX.x + 0.22, 0.26, BOX.z], 'teal'),
      kit.box([0.02, 0.06, 0.06], [BOX.x + 0.23, 0.36, BOX.z + 0.07], 'sunYellow'),
      kit.cylinder(0.015, 0.015, 0.22, [BOX.x - 0.1, 0.67, BOX.z + 0.1], 'stoneDark', { segments: 4 }),
      kit.sphere(0.05, [BOX.x - 0.1, 0.8, BOX.z + 0.1], 'red', { detail: 0 }),
      // cable along the ground
      kit.box([0.06, 0.02, 2.1], [0.5, 0.01, 0.05], 'charcoal'),
    );
    return kit.finish(parts);
  },
};
