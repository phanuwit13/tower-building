import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof } from '../../../models/parts';

// A little restroom building (2x2): a cream block with a teal gable roof (ridge along z), two doors on the +x
// front (blue and pink) each carrying a white picture sign (a round head over a body, no text), and a plant
// box along the +z end.
const WALLS = { x: -0.2, w: 1.3, l: 1.3, h: 0.86 }; // centre x, width (x), length (z), height above the plinth
const PLINTH = 0.04;
const FRONT_X = WALLS.x + WALLS.w / 2; // the +x wall surface
const TOP = PLINTH + WALLS.h;
const DOOR = { w: 0.3, h: 0.56, z: 0.3 };
const ROOF = { rise: 0.38, eave: 0.05 };
const SIGN_X = FRONT_X + 0.03 + 0.012; // just proud of a door slab

/** ห้องน้ำสาธารณะ: a restroom block with two picture-sign doors and a plant box. */
export const item: ItemModel = {
  id: 'restroom-block',
  name: 'ห้องน้ำสาธารณะ',
  category: 'facility',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([WALLS.w + 0.1, PLINTH, WALLS.l + 0.1], [WALLS.x, PLINTH / 2, 0], 'stone'),
      kit.box([WALLS.w, WALLS.h, WALLS.l], [WALLS.x, PLINTH + WALLS.h / 2, 0], 'cream'),
      ...gableRoof(kit, { at: [WALLS.x, TOP, 0], length: WALLS.l + 0.2, width: WALLS.w, rise: ROOF.rise, eave: ROOF.eave, color: 'teal', ridge: 'blue' }),
      // gable ends under the roof
      kit.wedge([WALLS.w, ROOF.rise, WALLS.l - 0.02], [WALLS.x, TOP + ROOF.rise / 2, 0], 'cream'),
    ];
    const doorY = PLINTH + DOOR.h / 2;
    const signY = PLINTH + DOOR.h * 0.58;
    // left (-z): blue door, a head over a trouser-block body; right (+z): pink door, a head over a dress
    parts.push(
      ...door(kit, { at: [FRONT_X, doorY, -DOOR.z], facing: 'x+', w: DOOR.w, h: DOOR.h, color: 'blue', knob: 'sunYellow' }),
      ...door(kit, { at: [FRONT_X, doorY, DOOR.z], facing: 'x+', w: DOOR.w, h: DOOR.h, color: 'pink', knob: 'sunYellow' }),
      kit.sphere(0.045, [SIGN_X, signY + 0.13, -DOOR.z], 'white', { detail: 0 }),
      kit.box([0.012, 0.13, 0.09], [SIGN_X, signY + 0.02, -DOOR.z], 'white'),
      kit.box([0.012, 0.09, 0.035], [SIGN_X, signY - 0.1, -DOOR.z - 0.025], 'white'),
      kit.box([0.012, 0.09, 0.035], [SIGN_X, signY - 0.1, -DOOR.z + 0.025], 'white'),
      kit.sphere(0.045, [SIGN_X, signY + 0.13, DOOR.z], 'white', { detail: 0 }),
      kit.wedge([0.15, 0.2, 0.012], [SIGN_X, signY - 0.01, DOOR.z], 'white', { rotate: [0, Math.PI / 2, 0] }),
      kit.box([0.012, 0.07, 0.035], [SIGN_X, signY - 0.14, DOOR.z - 0.025], 'white'),
      kit.box([0.012, 0.07, 0.035], [SIGN_X, signY - 0.14, DOOR.z + 0.025], 'white'),
    );
    // the plant box along the +z end, with bushes and a few flowers
    const boxZ = WALLS.l / 2 + 0.2;
    parts.push(
      kit.box([1.2, 0.2, 0.26], [WALLS.x, 0.1, boxZ], 'woodDark'),
      kit.box([1.12, 0.02, 0.2], [WALLS.x, 0.205, boxZ], 'bark'),
    );
    const plants: Array<[number, number, 'leaf' | 'leafDark' | 'pink' | 'sunYellow' | 'purple']> = [
      [-0.45, 0.17, 'leaf'], [-0.15, 0.2, 'leafDark'], [0.1, 0.17, 'leaf'], [0.38, 0.2, 'leafDark'],
      [-0.3, 0.33, 'pink'], [0, 0.35, 'sunYellow'], [0.25, 0.33, 'purple'],
    ];
    for (const [dx, r, color] of plants) {
      const flower = color === 'pink' || color === 'sunYellow' || color === 'purple';
      parts.push(kit.sphere(flower ? 0.05 : r * 0.7, [WALLS.x + dx, flower ? 0.27 : 0.2 + r * 0.55, boxZ], color, { detail: flower ? 0 : 1 }));
    }
    return kit.finish(parts);
  },
};
