import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod, wheel } from '../../../models/parts';

// A bread-seller's tricycle along z, nose to +z: one front wheel, two rear wheels either side of a
// wooden bread box with a red canopy and glass-blue top panels, and a breathing lantern on a pole.
const WR = { r: 0.16, tube: 0.03 };
const HUB = WR.r + WR.tube;
const REAR_Z = -0.38;
const FRONT_Z = 0.68;
const DECK = 0.36; // top of the bread-box floor
const BOX = { x: 0.6, z: 0.7, zc: -0.38 };

/** จักรยานขายขนมปัง: a tricycle with a glass box of bread and a little lantern. */
export const item: ItemModel = {
  id: 'bread-bike',
  name: 'จักรยานขายขนมปัง',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      ...wheel(kit, { at: [-0.37, HUB, REAR_Z], radius: WR.r, tube: WR.tube, axis: 'x', color: 'charcoal', spokes: 1, tubularSegments: 8 }),
      ...wheel(kit, { at: [0.37, HUB, REAR_Z], radius: WR.r, tube: WR.tube, axis: 'x', color: 'charcoal', spokes: 1, tubularSegments: 8 }),
      ...wheel(kit, { at: [0, HUB, FRONT_Z], radius: WR.r, tube: WR.tube, axis: 'x', color: 'charcoal', spokes: 1, tubularSegments: 8 }),
      kit.cylinder(0.02, 0.02, 0.74, [0, HUB, REAR_Z], 'stoneDark', { segments: 6, rotate: [0, 0, Math.PI / 2] }), // rear axle
      // frame: platform, long lower tube, fork, handlebar, seat
      kit.box([BOX.x, 0.04, BOX.z], [0, DECK - 0.02, BOX.zc], 'wood'),
      kit.box([0.05, 0.05, 0.62], [0, 0.3, 0.3], 'blue'),
      rod(kit, [0.04, HUB, FRONT_Z], [0.04, 0.62, 0.6], 0.018, 'chrome', { segments: 4 }),
      rod(kit, [-0.04, HUB, FRONT_Z], [-0.04, 0.62, 0.6], 0.018, 'chrome', { segments: 4 }),
      kit.box([0.42, 0.035, 0.035], [0, 0.64, 0.6], 'chrome'),
      kit.sphere(0.03, [0.2, 0.64, 0.6], 'sunYellow', { detail: 0 }),
      kit.sphere(0.03, [-0.2, 0.64, 0.6], 'sunYellow', { detail: 0 }),
      rod(kit, [0, 0.3, 0.22], [0, 0.5, 0.22], 0.02, 'chrome', { segments: 4 }),
      kit.box([0.15, 0.04, 0.22], [0, 0.52, 0.22], 'charcoal'),
    ];
    // the box: four posts, red canopy, pale glass-blue panels near the top, bread below
    const [hx, hz] = [BOX.x / 2 - 0.02, BOX.z / 2 - 0.02];
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) parts.push(kit.box([0.035, 0.42, 0.035], [sx * hx, DECK + 0.21, BOX.zc + sz * hz], 'chrome'));
    }
    parts.push(
      kit.box([BOX.x + 0.06, 0.04, BOX.z + 0.06], [0, DECK + 0.44, BOX.zc], 'red'),
      kit.box([0.02, 0.12, BOX.z - 0.08], [hx, DECK + 0.36, BOX.zc], 'glassBlue'),
      kit.box([0.02, 0.12, BOX.z - 0.08], [-hx, DECK + 0.36, BOX.zc], 'glassBlue'),
      kit.box([BOX.x - 0.08, 0.12, 0.02], [0, DECK + 0.36, BOX.zc + hz], 'glassBlue'),
      kit.box([BOX.x - 0.08, 0.12, 0.02], [0, DECK + 0.36, BOX.zc - hz], 'glassBlue'),
    );
    // loaves in two rows
    const loaf = (x: number, z: number, y: number, c: 'sand' | 'wood') => kit.sphere(0.075, [x, y, z], c, { detail: 0, scale: [1.2, 0.7, 1.7] });
    const ly = DECK + 0.05;
    parts.push(
      loaf(-0.16, BOX.zc - 0.2, ly, 'wood'), loaf(0.04, BOX.zc - 0.2, ly, 'sand'), loaf(0.2, BOX.zc - 0.2, ly, 'wood'),
      loaf(-0.12, BOX.zc + 0.17, ly, 'sand'), loaf(0.06, BOX.zc + 0.17, ly, 'wood'), loaf(0.21, BOX.zc + 0.17, ly, 'sand'),
      kit.box([0.5, 0.025, 0.06], [0, DECK + 0.025, BOX.zc], 'terracotta'), // baguette tray
    );
    // lantern pole on the rear corner of the canopy
    parts.push(
      kit.cylinder(0.018, 0.018, 0.34, [-0.28, DECK + 0.64, BOX.zc - 0.3], 'woodDark', { segments: 6 }),
      kit.sphere(0.07, [-0.28, DECK + 0.84, BOX.zc - 0.3], 'orange', { glow: 'lampWarm', light: 'breathe' }),
    );
    return kit.finish(parts);
  },
};
