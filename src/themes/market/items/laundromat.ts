import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';
import { glassWindow } from '../../../models/parts';

// A self-service laundrette (2×2, front on +x): a shop with a row of four washing machines
// out front. Each machine's drum (lit glass and a few clothes) spins about its own centre on an
// x axis, inside a fixed chrome ring. A purple bubble neon stands on the roof.
const BASE = 0.04;
const SHOP = { x: -0.45, w: 0.8, d: 1.8, top: 0.98 }; // x from -0.9 to -0.1
const FRONT = SHOP.x + SHOP.w / 2;
const MACHINE = { x: 0.14, w: 0.5, d: 0.42, h: 0.52, pitch: 0.46 };
const MACHINE_FRONT = MACHINE.x + MACHINE.w / 2;
const DRUM = { y: 0.27, rim: 0.13, tube: 0.025, glass: 0.105, clothes: 0.065 };
const CLOTHES: PaletteColor[] = ['pink', 'sunYellow', 'blue', 'lime'];
const SIGN = { x: -0.35, y: 1.42, halfZ: 0.75, halfY: 0.3 };

/** ร้านสะดวกซัก: a laundrette with spinning washing-machine drums and a bubble neon. */
export const item: ItemModel = {
  id: 'laundromat',
  name: 'ร้านสะดวกซัก',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.9, BASE, 1.9], [0, BASE / 2, 0], 'stone'),
      kit.box([SHOP.w, SHOP.top - BASE, SHOP.d], [SHOP.x, (BASE + SHOP.top) / 2, 0], 'mint'),
      kit.box([SHOP.w + 0.02, 0.1, SHOP.d + 0.02], [SHOP.x, BASE + 0.05, 0], 'teal'),
      kit.box([SHOP.w + 0.14, 0.08, SHOP.d + 0.14], [SHOP.x, SHOP.top + 0.04, 0], 'teal'),
    ];
    // windows (lit at night) on every side; the front ones sit above the machines
    for (const z of [-0.5, 0.5]) parts.push(...glassWindow(kit, { at: [FRONT, 0.78, z], facing: 'x+', w: 0.5, h: 0.22, panes: 2 }));
    parts.push(
      ...glassWindow(kit, { at: [SHOP.x, 0.6, SHOP.d / 2], facing: 'z+', w: 0.5, h: 0.38, panes: 2 }),
      ...glassWindow(kit, { at: [SHOP.x, 0.6, -SHOP.d / 2], facing: 'z-', w: 0.5, h: 0.38, panes: 2 }),
      ...glassWindow(kit, { at: [SHOP.x - SHOP.w / 2, 0.6, 0], facing: 'x-', w: 0.8, h: 0.38, panes: 3 }),
    );
    // four washing machines in a row against the shop front
    for (let i = 0; i < 4; i++) {
      const z = (i - 1.5) * MACHINE.pitch;
      const spin: MotionOpts = { kind: 'spin', pivot: [MACHINE_FRONT, DRUM.y, z], axis: [1, 0, 0], speed: 0.8 };
      parts.push(
        kit.box([MACHINE.w, MACHINE.h, MACHINE.d - 0.04], [MACHINE.x, BASE + MACHINE.h / 2, z], 'white'),
        kit.box([MACHINE.w + 0.02, 0.07, MACHINE.d - 0.02], [MACHINE.x, BASE + MACHINE.h + 0.035, z], 'blue'),
        kit.box([0.04, 0.12, MACHINE.d - 0.12], [MACHINE_FRONT, BASE + MACHINE.h - 0.07, z], 'stone'),
        kit.sphere(0.025, [MACHINE_FRONT + 0.02, BASE + MACHINE.h - 0.07, z + 0.12], 'sunYellow', { detail: 0 }),
        kit.torus(DRUM.rim, DRUM.tube, [MACHINE_FRONT, DRUM.y, z], 'chrome', { radialSegments: 4, tubularSegments: 12, rotate: [0, Math.PI / 2, 0] }),
        kit.cylinder(DRUM.glass, DRUM.glass, 0.03, [MACHINE_FRONT + 0.005, DRUM.y, z], 'skyBlue', { segments: 12, rotate: [0, 0, Math.PI / 2], glow: 'windowWarm', light: 'window', motion: spin }),
      );
      CLOTHES.forEach((color, j) => {
        const a = (j / CLOTHES.length) * Math.PI * 2 + i * 0.8;
        parts.push(kit.sphere(0.032, [MACHINE_FRONT + 0.035, DRUM.y + Math.cos(a) * DRUM.clothes, z + Math.sin(a) * DRUM.clothes], color, { detail: 0, scale: [0.7, 1, 1], motion: spin }));
      });
    }
    // rooftop bubble neon: a dark board on two legs with three glowing rings
    const bx = SIGN.x + 0.05;
    for (const z of [-0.5, 0.5]) parts.push(kit.box([0.06, SIGN.y - SIGN.halfY - SHOP.top - 0.08, 0.06], [SIGN.x, (SIGN.y - SIGN.halfY + SHOP.top + 0.08) / 2, z], 'charcoal'));
    parts.push(kit.box([0.06, SIGN.halfY * 2, SIGN.halfZ * 2], [SIGN.x, SIGN.y, 0], 'charcoal'));
    for (const [z, y, r] of [[-0.35, SIGN.y - 0.05, 0.17], [0.0, SIGN.y + 0.1, 0.11], [0.3, SIGN.y - 0.08, 0.14], [0.52, SIGN.y + 0.12, 0.07]] as const) {
      parts.push(kit.torus(r, 0.025, [bx, y, z], 'purple', { radialSegments: 4, tubularSegments: 12, rotate: [0, Math.PI / 2, 0], glow: 'purple' }));
    }
    return kit.finish(parts);
  },
};
