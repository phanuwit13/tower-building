import type { ItemModel } from '../../../models/contract';
import type { Part, Vec3 } from '../../../models/kit';
import { rod, wheel } from '../../../models/parts';

// A mint vintage bicycle on a low wooden stand with a flower basket on the front.
const DECK = 0.05;
const R = 0.32;
const TUBE = 0.03;
const HUB_Y = DECK + R + TUBE;
const REAR = -0.6;
const FRONT = 0.6;
const p = (z: number, y: number): Vec3 => [0, y, z]; // a point in the frame's plane
const BB = p(-0.12, 0.36);
const SEAT = p(-0.22, 0.8);
const HEAD_TOP = p(0.42, 0.84);
const HEAD_BOT = p(0.46, 0.7);

/** จักรยานวินเทจ: a vintage bicycle with a flower basket, on a stand. */
export const item: ItemModel = {
  id: 'bicycle-display',
  name: 'จักรยานวินเทจ',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([0.7, DECK, 1.9], [0, DECK / 2, 0], 'wood')];
    for (const z of [REAR, FRONT]) {
      parts.push(...wheel(kit, { at: [0, HUB_Y, z], radius: R, tube: TUBE, axis: 'x', color: 'charcoal', hubColor: 'chrome', spokes: 2, tubularSegments: 16 }));
    }
    const hubR = p(REAR, HUB_Y);
    const hubF = p(FRONT, HUB_Y);
    const frame: [Vec3, Vec3][] = [[hubR, BB], [hubR, SEAT], [BB, SEAT], [SEAT, HEAD_TOP], [BB, HEAD_BOT], [HEAD_BOT, hubF]];
    for (const [a, b] of frame) parts.push(rod(kit, a, b, 0.03, 'mint', { segments: 6 }));
    parts.push(
      rod(kit, HEAD_TOP, p(0.4, 0.95), 0.025, 'chrome', { segments: 6 }),
      kit.cylinder(0.025, 0.025, 0.46, [0, 0.95, 0.4], 'chrome', { segments: 6, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.035, 0.035, 0.1, [0.25, 0.95, 0.4], 'woodDark', { segments: 6, rotate: [0, 0, Math.PI / 2] }),
      kit.cylinder(0.035, 0.035, 0.1, [-0.25, 0.95, 0.4], 'woodDark', { segments: 6, rotate: [0, 0, Math.PI / 2] }),
      // saddle, cranks and pedals
      kit.sphere(0.11, [0, 0.87, -0.24], 'woodDark', { scale: [0.8, 0.4, 1.5] }),
      kit.cylinder(0.08, 0.08, 0.03, [0.06, 0.36, -0.12], 'chrome', { segments: 8, rotate: [0, 0, Math.PI / 2] }),
      kit.box([0.1, 0.03, 0.04], [0.1, 0.3, -0.04], 'charcoal'),
      kit.box([0.1, 0.03, 0.04], [0.1, 0.42, -0.2], 'charcoal'),
      // basket with flowers
      kit.cylinder(0.19, 0.14, 0.2, [0, 1.08, 0.58], 'sand', { segments: 10 }),
      kit.cylinder(0.2, 0.2, 0.03, [0, 1.19, 0.58], 'wood', { segments: 10 }),
      kit.sphere(0.07, [0.05, 1.23, 0.54], 'pink', { detail: 0 }),
      kit.sphere(0.07, [-0.06, 1.24, 0.62], 'sunYellow', { detail: 0 }),
      kit.sphere(0.065, [0.07, 1.23, 0.66], 'purple', { detail: 0 }),
      kit.sphere(0.065, [-0.07, 1.22, 0.5], 'white', { detail: 0 }),
      kit.sphere(0.07, [0, 1.26, 0.58], 'orange', { detail: 0 }),
      rod(kit, p(0.4, 0.95), p(0.46, 1.0), 0.02, 'chrome', { segments: 4 }),
    );
    return kit.finish(parts);
  },
};
