import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { wheel } from '../../../models/parts';

// A yellow push-cart (1×2, long side along z): a steaming pot full of corn cobs, a tray of cooked
// cobs, a blue-and-white parasol and a glowing lamp.
const CART = { w: 0.5, d: 1.0, y0: 0.2, h: 0.28, z: 0.05 };
const TOP = CART.y0 + CART.h + 0.04;
const POT = { r: 0.17, h: 0.3, z: 0.3 };
const POLE_Z = -0.3;
const COB_R = 0.035;
const COB_LEN = 0.22;

/** รถเข็นข้าวโพด: a yellow cart with steaming corn and a lamp. */
export const item: ItemModel = {
  id: 'corn-cart',
  name: 'รถเข็นข้าวโพด',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([CART.w, CART.h, CART.d], [0, CART.y0 + CART.h / 2, CART.z], 'sunYellow'),
      kit.box([CART.w + 0.04, 0.04, CART.d + 0.04], [0, CART.y0 + CART.h + 0.02, CART.z], 'white'),
      kit.box([CART.w + 0.01, 0.05, CART.d + 0.01], [0, CART.y0 + 0.07, CART.z], 'brass'),
      kit.box([0.04, 0.04, 0.4], [-0.18, CART.y0 + 0.15, -0.75], 'woodDark'),
      kit.box([0.04, 0.04, 0.4], [0.18, CART.y0 + 0.15, -0.75], 'woodDark'),
      kit.box([0.06, CART.y0, 0.06], [-0.2, CART.y0 / 2, 0.45], 'woodDark'),
      kit.box([0.06, CART.y0, 0.06], [0.2, CART.y0 / 2, 0.45], 'woodDark'),
      // steamer pot with a rim and a handle on each side
      kit.cylinder(POT.r, POT.r - 0.02, POT.h, [0, TOP + POT.h / 2, POT.z], 'chrome', { segments: 10 }),
      kit.cylinder(POT.r + 0.02, POT.r + 0.02, 0.03, [0, TOP + POT.h, POT.z], 'stoneDark', { segments: 10 }),
      kit.box([0.05, 0.03, 0.05], [POT.r + 0.04, TOP + POT.h - 0.05, POT.z], 'charcoal'),
      kit.box([0.05, 0.03, 0.05], [-POT.r - 0.04, TOP + POT.h - 0.05, POT.z], 'charcoal'),
      // red-and-green sauce pots
      kit.cylinder(0.045, 0.045, 0.1, [0.15, TOP + 0.05, -0.05], 'red', { segments: 8 }),
      kit.cylinder(0.045, 0.045, 0.1, [0.15, TOP + 0.05, -0.18], 'leaf', { segments: 8 }),
    ];
    // corn cobs standing in the pot, each with a green husk
    const cobs: [number, number][] = [[0, 0], [0.08, 0.05], [-0.08, 0.05], [0.05, -0.08], [-0.05, -0.08]];
    for (const [dx, dz] of cobs) {
      parts.push(
        kit.cylinder(COB_R, COB_R, 0.2, [dx, TOP + POT.h + 0.1, POT.z + dz], 'sunYellow', { segments: 6 }),
        kit.cone(COB_R + 0.01, 0.07, [dx, TOP + POT.h + 0.2 + 0.035, POT.z + dz], 'brass', { segments: 6 }),
        kit.cone(0.04, 0.09, [dx, TOP + POT.h + 0.035, POT.z + dz], 'leaf', { segments: 6, rotate: [Math.PI, 0, 0] }),
      );
    }
    // a tray of cooked cobs lying along x
    parts.push(kit.box([0.4, 0.03, 0.34], [-0.02, TOP + 0.015, -0.2], 'wood'));
    for (const z of [-0.32, -0.24, -0.16, -0.08]) {
      parts.push(
        kit.cylinder(COB_R, COB_R, COB_LEN, [-0.02, TOP + 0.03 + COB_R, z], 'sunYellow', { segments: 6, rotate: [0, 0, Math.PI / 2] }),
        kit.cone(COB_R, 0.05, [0.1 + 0.035, TOP + 0.03 + COB_R, z], 'leaf', { segments: 6, rotate: [0, 0, -Math.PI / 2] }),
      );
    }
    for (const sx of [-1, 1]) {
      parts.push(...wheel(kit, { at: [sx * (CART.w / 2 + 0.03), 0.19, -0.3], radius: 0.15, tube: 0.04, axis: 'x', color: 'charcoal', hubColor: 'stone' }));
    }
    // parasol and a glowing lamp on the pole top
    const canopyY = 1.2;
    parts.push(
      kit.cylinder(0.02, 0.02, canopyY - TOP, [0, (TOP + canopyY) / 2, POLE_Z], 'white', { segments: 6 }),
      kit.cone(0.46, 0.2, [0, canopyY, POLE_Z], 'blue', { segments: 6 }),
      kit.cone(0.46, 0.2, [0, canopyY, POLE_Z], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0], scale: [0.99, 1.01, 0.99] }),
      kit.sphere(0.06, [0, canopyY + 0.14, POLE_Z], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }),
    );
    for (const a of [0.4, 2.0, 3.6, 5.2]) {
      parts.push(kit.sphere(0.035, [0.4 * Math.cos(a), canopyY - 0.12, POLE_Z + 0.4 * Math.sin(a)], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }));
    }
    return kit.finish(parts);
  },
};
