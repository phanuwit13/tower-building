import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { gableRoof } from '../../../models/parts';

const WALL_TOP = 0.9;
const RISE = 0.3;
const HALF_X = 0.72; // walls at x = -HALF_X (back) ; open on +x
const HALF_Z = 0.82;
const FRONT_X = 0.45; // the front posts stand back so the racks show
const PITCH = Math.atan2(RISE, HALF_Z);
// slat centre: 0.09 (slab 0.08 + half a slat) off the roof's top face, 0.4 across from the ridge
const SLAT = { z: 0.4 + 0.09 * Math.sin(PITCH), y: WALL_TOP + RISE - 0.4 * Math.tan(PITCH) + 0.09 * Math.cos(PITCH) };
const LEVELS = [0.2, 0.43, 0.66];
const CAPS: PaletteColor[] = ['cream', 'sand', 'orange', 'cream'];

/** โรงเรือนเพาะเห็ด: a low shade house with green net walls, racks of mushroom bags and mushrooms popping out. */
export const item: ItemModel = {
  id: 'mushroom-house',
  name: 'โรงเรือนเพาะเห็ด',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([1.7, 0.03, 1.8], [0, 0.015, 0], 'bark')];
    // posts, lintel and net walls (back and -z side)
    for (const x of [-HALF_X, FRONT_X]) {
      for (const z of [-HALF_Z, HALF_Z]) parts.push(kit.box([0.08, WALL_TOP - 0.03, 0.08], [x, (WALL_TOP + 0.03) / 2, z], 'wood'));
    }
    parts.push(
      kit.box([0.06, 0.06, 2 * HALF_Z + 0.08], [FRONT_X, WALL_TOP - 0.03, 0], 'woodDark'),
      kit.box([0.06, 0.06, 2 * HALF_Z + 0.08], [-HALF_X, WALL_TOP - 0.03, 0], 'woodDark'),
      kit.box([0.04, WALL_TOP - 0.1, 2 * HALF_Z], [-HALF_X, WALL_TOP / 2 + 0.01, 0], 'leafDark'),
      kit.box([2 * HALF_X, WALL_TOP - 0.1, 0.04], [0, WALL_TOP / 2 + 0.01, -HALF_Z], 'leafDark'),
      ...gableRoof(kit, { at: [-0.25, WALL_TOP, 0], length: 1.4, width: 2 * HALF_Z, rise: RISE, eave: 0.1, color: 'leafDark', ridge: 'leaf', along: 'x' }),
      kit.wedge([2 * HALF_Z, RISE, 0.05], [-0.93, WALL_TOP + RISE / 2, 0], 'leafDark', { rotate: [0, Math.PI / 2, 0] }), // closes the back gable; the front stays open
    );
    // slats across the green shade-net roof
    for (let i = 0; i < 5; i++) {
      for (const sgn of [-1, 1]) parts.push(kit.box([0.05, 0.02, 0.64], [-0.8 + i * 0.28, SLAT.y, sgn * SLAT.z], 'leaf', { rotate: [sgn * PITCH, 0, 0] }));
    }
    // two racks of mushroom bags
    for (const rx of [-0.45, 0.12]) {
      for (const z of [-0.72, 0.72]) parts.push(kit.box([0.05, LEVELS[2], 0.05], [rx, 0.03 + LEVELS[2] / 2, z], 'wood'));
      LEVELS.forEach((y, li) => {
        parts.push(kit.box([0.36, 0.03, 1.5], [rx, y, 0], 'wood'));
        for (let i = 0; i < 3; i++) {
          const z = -0.5 + i * 0.5;
          parts.push(
            kit.box([0.14, 0.13, 0.14], [rx, y + 0.08, z], 'white'),
            kit.dome(0.06, [rx + 0.01 * (i % 2), y + 0.145, z], CAPS[(i + li) % 4], { segments: 6 }),
          );
          if ((i + li) % 2 === 0) parts.push(kit.dome(0.04, [rx + 0.075, y + 0.1, z + 0.02], CAPS[(i + li + 1) % 4], { segments: 6, rotate: [0, 0, -Math.PI / 2] }));
        }
      });
    }
    // crates and a basket of fresh mushrooms out front in the open
    parts.push(
      kit.box([0.3, 0.14, 0.4], [0.78, 0.1, 0.35], 'wood'),
      kit.dome(0.08, [0.72, 0.17, 0.27], 'cream', { segments: 6 }),
      kit.dome(0.07, [0.84, 0.17, 0.38], 'orange', { segments: 6 }),
      kit.dome(0.07, [0.72, 0.17, 0.47], 'woodDark', { segments: 6 }),
      kit.cylinder(0.17, 0.13, 0.14, [0.78, 0.1, -0.35], 'sand', { segments: 8 }),
      kit.dome(0.08, [0.74, 0.17, -0.35], 'white', { segments: 6 }),
      kit.dome(0.07, [0.84, 0.17, -0.3], 'wood', { segments: 6 }),
      kit.dome(0.06, [0.8, 0.17, -0.42], 'cream', { segments: 6 }),
    );
    return kit.finish(parts);
  },
};
