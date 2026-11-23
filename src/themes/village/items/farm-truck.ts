import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod, wheel } from '../../../models/parts';

// An e-taen farm truck: exposed engine at +z, a bench seat, then a wooden cargo bed of vegetables at -z.
const FRAME_Y = 0.26; // chassis centre height
const REAR = { r: 0.2, tube: 0.06, x: 0.38, z: -0.55 };
const FRONT = { r: 0.15, tube: 0.05, x: 0.36, z: 0.7 };
const BED = { w: 0.6, l: 0.94, z: -0.52, floorTop: 0.36 };
/** vegetables: [x, z, colour] on the floor, then a second layer */
const VEG: Array<[number, number, PaletteColor]> = [
  [-0.17, -0.2, 'orange'], [0, -0.2, 'red'], [0.17, -0.2, 'leaf'],
  [-0.17, -0.4, 'leaf'], [0, -0.4, 'orange'], [0.17, -0.4, 'purple'],
  [-0.17, -0.6, 'red'], [0, -0.6, 'leaf'], [0.17, -0.6, 'orange'],
  [-0.17, -0.8, 'lime'], [0, -0.8, 'red'], [0.17, -0.8, 'leaf'],
];
const VEG2: Array<[number, number, PaletteColor]> = [[-0.08, -0.3, 'sunYellow'], [0.09, -0.5, 'lime'], [-0.07, -0.7, 'orange'], [0.08, -0.85, 'leaf']];

/** รถอีแต๋น: a farm truck with an open engine and a wooden cargo bed of vegetables. */
export const item: ItemModel = {
  id: 'farm-truck',
  name: 'รถอีแต๋น',
  category: 'vehicle',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const sx of [-1, 1]) {
      parts.push(
        ...wheel(kit, { at: [sx * REAR.x, REAR.r + REAR.tube, REAR.z], radius: REAR.r, tube: REAR.tube, axis: 'x', color: 'charcoal', hubColor: 'sunYellow', hubRadius: 0.05, hubLength: 0.06, spokeColor: 'orange' }),
        ...wheel(kit, { at: [sx * FRONT.x, FRONT.r + FRONT.tube, FRONT.z], radius: FRONT.r, tube: FRONT.tube, axis: 'x', color: 'charcoal', hubColor: 'sunYellow', hubRadius: 0.04, hubLength: 0.05, spokeColor: 'orange' }),
      );
    }
    parts.push(
      // chassis and axles
      kit.box([0.46, 0.08, 1.84], [0, FRAME_Y, 0.03], 'woodDark'),
      kit.cylinder(0.03, 0.03, 0.76, [0, REAR.r + REAR.tube, REAR.z], 'stoneDark', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.025, 0.025, 0.72, [0, FRONT.r + FRONT.tube, FRONT.z], 'stoneDark', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      // open engine: red block, chrome pistons, flywheel, exhaust, radiator, headlights
      kit.box([0.34, 0.28, 0.4], [0, 0.44, 0.72], 'red'),
      ...[-0.09, 0, 0.09].map((dx) => kit.cylinder(0.04, 0.04, 0.16, [dx, 0.66, 0.68], 'chrome', { segments: 8 })),
      kit.cylinder(0.12, 0.12, 0.04, [0.2, 0.5, 0.72], 'charcoal', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.035, 0.035, 0.5, [-0.12, 0.8, 0.82], 'charcoal', { segments: 8 }),
      kit.box([0.3, 0.22, 0.05], [0, 0.42, 0.945], 'chrome'),
      kit.sphere(0.04, [-0.11, 0.56, 0.945], 'lampWarm', { detail: 0, glow: true }),
      kit.sphere(0.04, [0.11, 0.56, 0.945], 'lampWarm', { detail: 0, glow: true }),
      // seat and steering
      kit.box([0.3, 0.12, 0.26], [0, 0.36, 0.2], 'woodDark'),
      kit.box([0.34, 0.05, 0.3], [0, 0.46, 0.2], 'blue'),
      kit.box([0.34, 0.26, 0.05], [0, 0.6, 0.05], 'blue'),
      rod(kit, [0, 0.35, 0.45], [0, 0.72, 0.38], 0.022, 'chrome'),
      kit.box([0.4, 0.04, 0.04], [0, 0.73, 0.38], 'charcoal'),
      // cargo bed
      kit.box([BED.w, 0.06, BED.l], [0, BED.floorTop - 0.03, BED.z], 'wood'),
      kit.box([0.04, 0.2, BED.l], [BED.w / 2 - 0.02, BED.floorTop + 0.1, BED.z], 'woodDark'),
      kit.box([0.04, 0.2, BED.l], [-BED.w / 2 + 0.02, BED.floorTop + 0.1, BED.z], 'woodDark'),
      kit.box([BED.w, 0.2, 0.04], [0, BED.floorTop + 0.1, BED.z - BED.l / 2 + 0.02], 'woodDark'),
      kit.box([BED.w, 0.2, 0.04], [0, BED.floorTop + 0.1, BED.z + BED.l / 2 - 0.02], 'woodDark'),
    );
    for (const [x, z, c] of VEG) parts.push(kit.sphere(0.09, [x, BED.floorTop + 0.08, z], c, { detail: 0 }));
    for (const [x, z, c] of VEG2) parts.push(kit.sphere(0.08, [x, BED.floorTop + 0.2, z], c, { detail: 0 }));
    return kit.finish(parts);
  },
};
