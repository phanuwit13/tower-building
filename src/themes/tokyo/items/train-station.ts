import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// A station: a cream building on the -x side with lit windows and a neon train sign, a platform under a
// glass roof on posts, and a white train with a green stripe on the track at +x (it runs along z).
const PLAT_TOP = 0.1;
const BLD = { x0: -1, x1: -0.45, top: 1.3, z: 1.45 };
const TRAIN = { x: 0.58, z0: -1.25, z1: 1.25, y: 0.4, w: 0.5, h: 0.42 };
const ROOF_Y = 1.4;

/** สถานีรถไฟ: a station with a glass platform roof, a neon train sign and a green-striped train. */
export const item: ItemModel = {
  id: 'train-station',
  name: 'สถานีรถไฟ',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const bx = (BLD.x0 + BLD.x1) / 2;
    const parts: Part[] = [
      // platform and track bed
      kit.box([1.15, PLAT_TOP, 2.96], [-0.425, PLAT_TOP / 2, 0], 'stone'),
      kit.box([0.85, 0.05, 2.96], [0.575, 0.025, 0], 'stoneDark'),
      kit.box([0.05, 0.012, 2.9], [0.2, PLAT_TOP + 0.006, 0], 'sunYellow'),
      kit.box([0.03, 0.03, 2.9], [0.4, 0.065, 0], 'chrome'),
      kit.box([0.03, 0.03, 2.9], [0.76, 0.065, 0], 'chrome'),
      // station building
      kit.box([BLD.x1 - BLD.x0, BLD.top - PLAT_TOP, BLD.z * 2], [bx, (BLD.top + PLAT_TOP) / 2, 0], 'cream'),
      kit.box([BLD.x1 - BLD.x0, 0.08, BLD.z * 2 + 0.04], [bx, BLD.top + 0.04, 0], 'blue'),
      ...door(kit, { at: [BLD.x1, PLAT_TOP + 0.3, 0], facing: 'x+', w: 0.34, h: 0.6, color: 'woodDark' }),
      // glass roof over the platform: ribs, panes and posts
      kit.box([0.7, 0.04, 2.9], [-0.1, ROOF_Y, 0], 'skyBlue'),
      kit.box([0.06, 0.05, 2.9], [0.22, ROOF_Y + 0.02, 0], 'charcoal'),
    ];
    for (let i = 0; i < 7; i++) parts.push(kit.box([0.7, 0.05, 0.05], [-0.1, ROOF_Y + 0.03, -1.4 + (i * 2.8) / 6], 'charcoal'));
    for (const z of [-1.35, 0, 1.35]) {
      parts.push(kit.box([0.06, ROOF_Y - 0.1, 0.06], [0.22, 0.1 + (ROOF_Y - 0.1) / 2, z], 'charcoal'));
      parts.push(kit.sphere(0.04, [-0.1, ROOF_Y - 0.08, z], 'lampWarm', { detail: 0, glow: true }));
    }
    for (const z of [-0.95, -0.5, 0.5, 0.95]) {
      parts.push(...glassWindow(kit, { at: [BLD.x1, 0.78, z], facing: 'x+', w: 0.3, h: 0.36, panes: 1 }));
    }
    // the train: white body, green stripe, lit windows both sides, bogies, a cab window and lamps at +z
    const tz = (TRAIN.z0 + TRAIN.z1) / 2;
    const tl = TRAIN.z1 - TRAIN.z0;
    parts.push(
      kit.box([TRAIN.w, TRAIN.h, tl], [TRAIN.x, TRAIN.y, tz], 'white'),
      kit.box([TRAIN.w + 0.02, 0.08, tl + 0.02], [TRAIN.x, 0.36, tz], 'leaf'),
      kit.box([TRAIN.w - 0.06, 0.04, tl - 0.1], [TRAIN.x, TRAIN.y + TRAIN.h / 2 + 0.02, tz], 'stone'),
      kit.box([0.3, 0.07, 0.26], [TRAIN.x, 0.15, -0.8], 'charcoal'),
      kit.box([0.3, 0.07, 0.26], [TRAIN.x, 0.15, 0.8], 'charcoal'),
      ...glassWindow(kit, { at: [TRAIN.x, 0.48, TRAIN.z1], facing: 'z+', w: 0.34, h: 0.16, panes: 2 }),
      kit.sphere(0.035, [TRAIN.x - 0.17, 0.3, TRAIN.z1 + 0.02], 'lampWarm', { detail: 0, glow: true }),
      kit.sphere(0.035, [TRAIN.x + 0.17, 0.3, TRAIN.z1 + 0.02], 'lampWarm', { detail: 0, glow: true }),
    );
    for (const z of [-0.85, -0.3, 0.25, 0.8]) {
      parts.push(...glassWindow(kit, { at: [TRAIN.x + TRAIN.w / 2, 0.5, z], facing: 'x+', w: 0.28, h: 0.14, panes: 1 }));
      parts.push(...glassWindow(kit, { at: [TRAIN.x - TRAIN.w / 2, 0.5, z], facing: 'x-', w: 0.28, h: 0.14, panes: 1 }));
    }
    // neon train sign on the building roof (a picture of a little train, both faces)
    const SX = -0.72;
    parts.push(
      kit.box([0.06, 0.5, 1.0], [SX, 1.62 + 0.25, 0], 'charcoal'),
      kit.box([0.05, 0.3, 0.05], [SX, BLD.top + 0.2, -0.4], 'charcoal'),
      kit.box([0.05, 0.3, 0.05], [SX, BLD.top + 0.2, 0.4], 'charcoal'),
    );
    for (const s of [1, -1]) {
      const x = SX + s * 0.04;
      parts.push(
        kit.box([0.03, 0.24, 0.5], [x, 1.9, 0], 'teal', { glow: 'teal' }),
        kit.box([0.04, 0.07, 0.1], [x + s * 0.005, 1.95, -0.14], 'windowWarm', { glow: 'windowWarm' }),
        kit.box([0.04, 0.07, 0.1], [x + s * 0.005, 1.95, 0.14], 'windowWarm', { glow: 'windowWarm' }),
        kit.box([0.04, 0.04, 0.54], [x + s * 0.005, 1.84, 0], 'lime', { glow: 'lime' }),
        kit.sphere(0.04, [x + s * 0.01, 1.74, -0.17], 'pink', { detail: 0, glow: true }),
        kit.sphere(0.04, [x + s * 0.01, 1.74, 0.17], 'pink', { detail: 0, glow: true }),
      );
    }
    return kit.finish(parts);
  },
};
