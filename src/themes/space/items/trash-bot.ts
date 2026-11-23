import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// A bin-shaped blue robot on little treads: lid, two eyes on +x, antenna and two arms with orange claws.
/** หุ่นยนต์เก็บขยะ: a little bin-shaped robot with arms. */
export const item: ItemModel = {
  id: 'trash-bot',
  name: 'หุ่นยนต์เก็บขยะ',
  category: 'decoration',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.4, 0.1, 0.12], [0, 0.05, -0.2], 'charcoal'),
      kit.box([0.4, 0.1, 0.12], [0, 0.05, 0.2], 'charcoal'),
      kit.box([0.3, 0.06, 0.3], [0, 0.13, 0], 'stoneDark'),
      kit.cylinder(0.24, 0.2, 0.34, [0, 0.33, 0], 'blue', { segments: 12 }),
      kit.cylinder(0.25, 0.25, 0.05, [0, 0.52, 0], 'sunYellow', { segments: 12 }),
      kit.cylinder(0.2, 0.2, 0.04, [0, 0.43, 0], 'white', { segments: 12 }),
      // face
      kit.sphere(0.055, [0.2, 0.38, -0.09], 'white', { detail: 0 }),
      kit.sphere(0.055, [0.2, 0.38, 0.09], 'white', { detail: 0 }),
      kit.sphere(0.03, [0.245, 0.38, -0.09], 'navy', { detail: 0 }),
      kit.sphere(0.03, [0.245, 0.38, 0.09], 'navy', { detail: 0 }),
      kit.box([0.03, 0.03, 0.14], [0.22, 0.27, 0], 'charcoal'),
      // antenna and a crumpled paper ball on the lid
      kit.cylinder(0.015, 0.015, 0.2, [-0.1, 0.65, 0.1], 'stoneDark', { segments: 4 }),
      kit.sphere(0.045, [-0.1, 0.77, 0.1], 'red', { detail: 0 }),
      kit.sphere(0.06, [0.05, 0.58, -0.08], 'mint', { detail: 0 }),
      // arms
      rod(kit, [0, 0.36, -0.23], [0.2, 0.26, -0.37], 0.025, 'chrome', { segments: 6 }),
      rod(kit, [0, 0.36, 0.23], [0.2, 0.26, 0.37], 0.025, 'chrome', { segments: 6 }),
      kit.sphere(0.06, [0.22, 0.26, -0.38], 'orange', { detail: 0 }),
      kit.sphere(0.06, [0.22, 0.26, 0.38], 'orange', { detail: 0 }),
    ];
    return kit.finish(parts);
  },
};
