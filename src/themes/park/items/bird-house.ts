import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit, Vec3 } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const POLE_H = 0.95;
const BOX = { w: 0.32, h: 0.3, d: 0.3, y: POLE_H + 0.15 }; // body, centre y
const ROOF = { w: 0.42, h: 0.2, len: 0.44 };

/** A little bird at `at`, facing +x. */
function bird(kit: StyleKit, at: Vec3, body: PaletteColor, wing: PaletteColor): Part[] {
  const [x, y, z] = at;
  return [
    kit.sphere(0.07, [x, y, z], body, { detail: 0, scale: [1.2, 0.95, 0.9] }),
    kit.sphere(0.05, [x + 0.07, y + 0.06, z], body, { detail: 0 }),
    kit.cone(0.02, 0.05, [x + 0.12, y + 0.06, z], 'orange', { segments: 6, rotate: [0, 0, -Math.PI / 2] }),
    kit.sphere(0.012, [x + 0.095, y + 0.085, z + 0.035], 'charcoal', { detail: 0 }),
    kit.sphere(0.012, [x + 0.095, y + 0.085, z - 0.035], 'charcoal', { detail: 0 }),
    kit.sphere(0.05, [x - 0.015, y + 0.01, z + 0.055], wing, { detail: 0, scale: [1.2, 0.7, 0.5] }),
    kit.sphere(0.05, [x - 0.015, y + 0.01, z - 0.055], wing, { detail: 0, scale: [1.2, 0.7, 0.5] }),
    kit.sphere(0.04, [x - 0.1, y + 0.005, z], wing, { detail: 0, scale: [1.4, 0.4, 0.8] }),
  ];
}

/** บ้านนก: a bird house on a pole with two little birds. */
export const item: ItemModel = {
  id: 'bird-house',
  name: 'บ้านนก',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(0.36, 0.38, 0.03, [0, 0.015, 0], 'lime', { segments: 12 }),
      kit.cylinder(0.04, 0.05, POLE_H, [0, POLE_H / 2, 0], 'woodDark', { segments: 7 }),
      kit.box([BOX.w, BOX.h, BOX.d], [0, BOX.y, 0], 'sunYellow'),
      // roof, ridge along x so the +x end shows the gable
      kit.wedge([ROOF.w, ROOF.h, ROOF.len], [0, BOX.y + BOX.h / 2 + ROOF.h / 2, 0], 'red', { rotate: [0, Math.PI / 2, 0] }),
      kit.box([0.04, 0.04, 0.46], [0, BOX.y + BOX.h / 2 + ROOF.h, 0], 'redDark', { rotate: [0, Math.PI / 2, 0] }),
      // entrance hole, perch, flower on the front
      kit.cylinder(0.055, 0.055, 0.02, [BOX.w / 2 + 0.005, BOX.y + 0.03, 0], 'charcoal', { segments: 10, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.014, 0.014, 0.12, [BOX.w / 2 + 0.05, BOX.y - 0.1, 0], 'woodDark', { segments: 5, rotate: [0, 0, Math.PI / 2] }),
      kit.sphere(0.035, [BOX.w / 2 + 0.01, BOX.y + 0.0, 0.1], 'pink', { detail: 0 }),
      kit.sphere(0.035, [BOX.w / 2 + 0.01, BOX.y - 0.08, -0.1], 'purple', { detail: 0 }),
    ];
    parts.push(
      ...bird(kit, [BOX.w / 2 + 0.07, BOX.y - 0.1 + 0.014 + 0.065, 0], 'blue', 'navy'), // on the perch
      ...bird(kit, [-0.02, BOX.y + BOX.h / 2 + ROOF.h + 0.02 + 0.06, 0.0], 'pink', 'purple'), // on the roof ridge
    );
    // a tuft of flowers at the foot of the pole
    for (const [x, z, c] of [[0.12, 0.1, 'sunYellow'], [-0.1, 0.14, 'pink'], [0.05, -0.15, 'orange']] as const) {
      parts.push(kit.sphere(0.05, [x, 0.07, z], 'leaf', { detail: 0 }), kit.sphere(0.03, [x, 0.13, z], c, { detail: 0 }));
    }
    return kit.finish(parts);
  },
};
