import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof, glassWindow } from '../../../models/parts';

// A small clinic, front on +x. The sign is a round teal board with a white paw print (no red cross),
// on a post in the little front garden.
const LAWN_H = 0.03;
const WALL = { w: 1.0, l: 1.3, h: 0.6, x: -0.35 };
const WALL_TOP = LAWN_H + WALL.h;
const FRONT = WALL.x + WALL.w / 2;
const RISE = 0.3;
const SIGN = { x: 0.62, z: 0.55, y: 0.74, r: 0.19 };

/** A white paw print lying on the +x face of the sign. */
function paw(kit: Parameters<ItemModel['build']>[0]): Part[] {
  const x = SIGN.x + 0.03;
  const parts: Part[] = [kit.sphere(1, [x, SIGN.y - 0.04, SIGN.z], 'white', { detail: 0, scale: [0.012, 0.065, 0.08] })];
  for (const [dz, dy] of [[-0.1, 0.05], [-0.036, 0.1], [0.036, 0.1], [0.1, 0.05]]) {
    parts.push(kit.sphere(1, [x, SIGN.y + dy, SIGN.z + dz], 'white', { detail: 0, scale: [0.012, 0.035, 0.03] }));
  }
  return parts;
}

/** คลินิกสัตว์: the animal clinic with a paw-print sign and a small front garden. */
export const item: ItemModel = {
  id: 'animal-clinic',
  name: 'คลินิกสัตว์',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.9, LAWN_H, 1.9], [0, LAWN_H / 2, 0], 'lime'),
      kit.box([WALL.w, WALL.h, WALL.l], [WALL.x, LAWN_H + WALL.h / 2, 0], 'cream'),
      kit.wedge([WALL.w, RISE, WALL.l], [WALL.x, WALL_TOP + RISE / 2, 0], 'cream'),
      ...gableRoof(kit, { at: [WALL.x, WALL_TOP, 0], length: 1.5, width: WALL.w, rise: RISE, eave: 0.08, color: 'teal', ridge: 'navy' }),
      ...door(kit, { at: [FRONT, LAWN_H + 0.22, -0.3], facing: 'x+', w: 0.26, h: 0.44, color: 'orange', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [FRONT, 0.36, 0.28], facing: 'x+', w: 0.4, h: 0.26 }),
      ...glassWindow(kit, { at: [WALL.x, 0.36, 0.65], facing: 'z+', w: 0.4, h: 0.26 }),
      ...glassWindow(kit, { at: [WALL.x, 0.36, -0.65], facing: 'z-', w: 0.4, h: 0.26 }),
      ...glassWindow(kit, { at: [WALL.x - WALL.w / 2, 0.36, 0], facing: 'x-', w: 0.4, h: 0.26 }),
      kit.box([0.6, 0.04, 0.34], [FRONT + 0.3, 0.03 + 0.02, -0.3], 'sand'), // path to the door
      // sign post and board
      kit.cylinder(0.03, 0.03, 0.72, [SIGN.x - 0.04, LAWN_H + 0.36, SIGN.z], 'wood', { segments: 6 }),
      kit.cylinder(SIGN.r, SIGN.r, 0.04, [SIGN.x, SIGN.y, SIGN.z], 'teal', { segments: 16, rotate: [0, 0, Math.PI / 2] }),
      ...paw(kit),
      // garden: bushes with flowers, planter
      kit.sphere(0.15, [0.8, LAWN_H + 0.1, -0.78], 'leaf', { scale: [1, 0.8, 1] }),
      kit.sphere(0.12, [0.45, LAWN_H + 0.08, -0.82], 'leafDark', { scale: [1, 0.8, 1] }),
      kit.sphere(0.13, [0.78, LAWN_H + 0.09, 0.85 - 0.08], 'leaf', { scale: [1, 0.8, 1] }),
      kit.sphere(0.03, [0.84, LAWN_H + 0.2, -0.76], 'pink', { detail: 0 }),
      kit.sphere(0.03, [0.74, LAWN_H + 0.19, -0.82], 'sunYellow', { detail: 0 }),
      kit.sphere(0.03, [0.82, LAWN_H + 0.18, 0.74], 'purple', { detail: 0 }),
      kit.sphere(0.03, [0.72, LAWN_H + 0.17, 0.8], 'pink', { detail: 0 }),
      kit.box([0.26, 0.12, 0.26], [0.2, LAWN_H + 0.06, 0.75], 'terracotta'),
      kit.sphere(0.04, [0.2, LAWN_H + 0.15, 0.75], 'sunYellow', { detail: 0 }),
      kit.sphere(0.1, [0.2, LAWN_H + 0.17, 0.75], 'leaf', { detail: 0, scale: [1, 0.6, 1] }),
    ];
    // low white picket fence across the front of the yard, with a gap for the path
    for (let z = -0.8; z <= 0.81; z += 0.2) {
      if (Math.abs(z + 0.3) < 0.2) continue;
      parts.push(kit.box([0.04, 0.16, 0.06], [0.93, LAWN_H + 0.08, z], 'white'));
    }
    parts.push(kit.box([0.03, 0.03, 1.7], [0.93, LAWN_H + 0.1, 0], 'white'));
    return kit.finish(parts);
  },
};
