import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { gableRoof } from '../../../models/parts';

const FLOOR_TOP = 0.15; // raised floor
const POST_X = 0.6;
const POST_Z = [-1.2, 0, 1.2];
const EAVES = 1.05; // wall-top height (roof starts here)
const RISE = 0.5;
const BREATHE = { glow: true, light: 'breathe' } as const;

/** ศาลากลางบ้าน: an open meeting hall with a plain tiled gable roof, benches, a picture notice board and hanging lamps. */
export const item: ItemModel = {
  id: 'village-hall',
  name: 'ศาลากลางบ้าน',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.64, 0.1, 2.8], [0, 0.05, 0], 'stone'),
      kit.box([1.56, 0.05, 2.72], [0, 0.125, 0], 'sand'),
      kit.box([0.2, 0.07, 0.5], [0.9, 0.035, 0.5], 'stone'), // front step
    ];
    for (const x of [-POST_X, POST_X]) {
      for (const z of POST_Z) parts.push(kit.box([0.1, EAVES - FLOOR_TOP, 0.1], [x, (EAVES + FLOOR_TOP) / 2, z], 'wood'));
    }
    for (const z of POST_Z) parts.push(kit.box([2 * POST_X + 0.1, 0.07, 0.07], [0, EAVES - 0.05, z], 'woodDark')); // tie beams
    // ridge beam under the roof, where the lamps hang
    parts.push(kit.box([0.06, 0.08, 2.6], [0, 1.43, 0], 'woodDark'));
    parts.push(
      ...gableRoof(kit, { at: [0, EAVES, 0], length: 2.9, width: 1.4, rise: RISE, eave: 0.2, color: 'terracotta', ridge: 'redDark' }),
      kit.wedge([1.4, RISE, 0.06], [0, EAVES + RISE / 2, 1.38], 'cream'), // gable ends
      kit.wedge([1.4, RISE, 0.06], [0, EAVES + RISE / 2, -1.38], 'cream'),
    );
    // plain benches along the back and across the ends
    parts.push(kit.box([0.22, 0.05, 2.3], [-0.38, 0.31, 0], 'wood'));
    for (const z of [-1.06, 1.06]) parts.push(kit.box([0.22, 0.05, 0.4], [-0.38, 0.31, z], 'wood'));
    for (const z of [-0.9, 0.9]) parts.push(kit.box([0.12, 0.16, 0.12], [-0.38, 0.23, z], 'woodDark'));
    parts.push(kit.box([0.12, 0.16, 0.12], [-0.38, 0.23, 0], 'woodDark'));
    // notice board in front: colour blocks and pictures only
    for (const dz of [-0.28, 0.28]) parts.push(kit.box([0.05, 0.4, 0.05], [0.9, 0.2, -0.95 + dz], 'woodDark'));
    parts.push(
      kit.box([0.04, 0.4, 0.74], [0.9, 0.6, -0.95], 'woodDark'),
      kit.box([0.03, 0.32, 0.66], [0.92, 0.6, -0.95], 'cream'),
      kit.box([0.01, 0.12, 0.16], [0.94, 0.68, -1.15], 'blue'),
      kit.box([0.01, 0.12, 0.16], [0.94, 0.52, -1.15], 'leaf'),
      kit.cylinder(0.07, 0.07, 0.01, [0.94, 0.62, -0.95], 'sunYellow', { rotate: [0, 0, Math.PI / 2], segments: 8 }),
      kit.cone(0.08, 0.12, [0.94, 0.5, -0.95], 'leafDark', { rotate: [0, 0, -Math.PI / 2], segments: 4 }),
      kit.box([0.01, 0.12, 0.16], [0.94, 0.68, -0.75], 'pink'),
      kit.box([0.01, 0.12, 0.16], [0.94, 0.52, -0.75], 'orange'),
    );
    // big lamps on the open +x side and the +z end (they show from the camera), and a glowing strip along the front eave
    for (const z of [-0.6, 0.6]) {
      parts.push(
        kit.cylinder(0.015, 0.015, 0.12, [0.78, 0.96, z], 'stoneDark', { segments: 4 }),
        kit.sphere(0.14, [0.78, 0.76, z], 'lampWarm', { ...BREATHE }),
      );
    }
    for (const x of [-0.4, 0.4]) {
      parts.push(
        kit.cylinder(0.015, 0.015, 0.16, [x, 0.98, 1.3], 'stoneDark', { segments: 4 }),
        kit.sphere(0.14, [x, 0.76, 1.3], 'lampWarm', { ...BREATHE }),
      );
    }
    parts.push(kit.box([0.05, 0.05, 2.5], [0.86, 0.9, 0], 'lampWarm', { ...BREATHE }));
    for (const z of [-0.6, 0.6]) {
      parts.push(
        kit.cylinder(0.012, 0.012, 0.14, [0, 1.34, z], 'stoneDark', { segments: 4 }),
        kit.sphere(0.1, [0, 1.2, z], 'lampWarm', { ...BREATHE }),
        kit.cylinder(0.05, 0.1, 0.04, [0, 1.3, z], 'brass', { segments: 8 }),
      );
    }
    return kit.finish(parts);
  },
};
