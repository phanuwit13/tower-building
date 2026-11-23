import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { gableRoof } from '../../../models/parts';

const POST_X = 0.33;
const POST_Z = 0.78;
const EAVES = 0.95;
const RISE = 0.32;

/** ศาลาริมทาง: a small roadside shelter, four posts, a plain tiled roof and a bench along the back. */
export const item: ItemModel = {
  id: 'roadside-sala',
  name: 'ศาลาริมทาง',
  category: 'seating',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.8, 0.06, 1.8], [0, 0.03, 0], 'stone')];
    for (const x of [-POST_X, POST_X]) {
      for (const z of [-POST_Z, POST_Z]) parts.push(kit.box([0.08, EAVES - 0.06, 0.08], [x, (EAVES + 0.06) / 2, z], 'wood'));
      parts.push(kit.box([0.06, 0.06, 2 * POST_Z + 0.08], [x, EAVES - 0.04, 0], 'woodDark'));
    }
    parts.push(
      ...gableRoof(kit, { at: [0, EAVES, 0], length: 1.94, width: 0.66, rise: RISE, eave: 0.08, color: 'red', ridge: 'redDark' }),
      kit.wedge([0.66, RISE, 0.05], [0, EAVES + RISE / 2, 0.93], 'cream'),
      kit.wedge([0.66, RISE, 0.05], [0, EAVES + RISE / 2, -0.93], 'cream'),
      // bench along the back with a low backrest
      kit.box([0.26, 0.05, 1.5], [-0.15, 0.31, 0], 'wood'),
      kit.box([0.04, 0.2, 1.5], [-0.29, 0.45, 0], 'woodDark'),
    );
    for (const z of [-0.65, 0, 0.65]) parts.push(kit.box([0.12, 0.25, 0.08], [-0.15, 0.185, z], 'woodDark'));
    // flower pot by the front post
    parts.push(
      kit.cylinder(0.08, 0.06, 0.13, [0.36, 0.125, 0.4], 'terracotta', { segments: 8 }),
      kit.sphere(0.09, [0.36, 0.25, 0.4], 'leaf', { detail: 0 }),
      kit.sphere(0.04, [0.38, 0.34, 0.42], 'pink', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
