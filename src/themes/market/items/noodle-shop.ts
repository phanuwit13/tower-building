import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, gableRoof, glassWindow, rod, wheel } from '../../../models/parts';

// A mint shop-front noodle restaurant at the back with a giant bowl on its roof and an orange
// bowl neon on a navy board, and a steaming pot cart with a breathing lantern out front.
const PAD = 0.03;
const SHOP = { x0: -0.88, x1: 0.05, z: 1.8, wall: 0.8 };
const SIGN_Y = 0.64;
const TUBE = 0.035;
const CART = { x: 0.65, z: 0.5 };

/** ร้านก๋วยเตี๋ยว: a noodle shop with a steaming pot cart out front and a bowl neon. */
export const item: ItemModel = {
  id: 'noodle-shop',
  name: 'ร้านก๋วยเตี๋ยว',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const cx = (SHOP.x0 + SHOP.x1) / 2;
    const w = SHOP.x1 - SHOP.x0;
    const ridgeY = SHOP.wall + 0.28;
    const parts: Part[] = [
      kit.box([1.96, PAD, 1.96], [0, PAD / 2, 0], 'stone'),
      kit.box([w, SHOP.wall - PAD, SHOP.z], [cx, (PAD + SHOP.wall) / 2, 0], 'mint'),
      kit.wedge([w, 0.28, SHOP.z - 0.02], [cx, SHOP.wall + 0.14, 0], 'mint'),
      ...gableRoof(kit, { at: [cx, SHOP.wall, 0], length: SHOP.z + 0.1, width: w, rise: 0.28, eave: 0.06, color: 'terracotta', ridge: 'redDark' }),
      ...door(kit, { at: [SHOP.x1, PAD + 0.2, -0.2], facing: 'x+', w: 0.28, h: 0.4, color: 'woodDark', knob: 'sunYellow' }),
      ...glassWindow(kit, { at: [SHOP.x1, 0.3, -0.68], facing: 'x+', w: 0.28, h: 0.2, panes: 1 }),
      ...glassWindow(kit, { at: [SHOP.x1, 0.3, 0.4], facing: 'x+', w: 0.5, h: 0.2 }),
      ...glassWindow(kit, { at: [SHOP.x1, 0.3, 0.7], facing: 'x+', w: 0.1, h: 0.2, panes: 1 }),
      ...glassWindow(kit, { at: [-0.45, 0.4, SHOP.z / 2], facing: 'z+', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [-0.45, 0.4, -SHOP.z / 2], facing: 'z-', w: 0.5, h: 0.3 }),
      ...glassWindow(kit, { at: [SHOP.x0, 0.4, 0], facing: 'x-', w: 0.7, h: 0.3, panes: 3 }),
      kit.box([0.05, 0.3, 0.9], [SHOP.x1 + 0.025, SIGN_Y, 0], 'navy'),
      // giant bowl on the roof: red bowl, noodle heap, two chopsticks
      kit.cylinder(0.3, 0.14, 0.22, [cx, ridgeY + 0.11, 0], 'red', { segments: 12 }),
      kit.cylinder(0.31, 0.31, 0.03, [cx, ridgeY + 0.215, 0], 'white', { segments: 12 }),
      kit.sphere(0.27, [cx, ridgeY + 0.23, 0], 'sand', { scale: [1, 0.5, 1] }),
      rod(kit, [cx - 0.05, ridgeY + 0.3, 0.1], [cx + 0.16, ridgeY + 0.55, 0.28], 0.018, 'wood', { segments: 4 }),
      rod(kit, [cx - 0.01, ridgeY + 0.3, 0.1], [cx + 0.2, ridgeY + 0.55, 0.3], 0.018, 'wood', { segments: 4 }),
    ];
    // bowl neon: a half-round bowl, two chopsticks and a steam curl
    const N = (dy: number, dz: number): [number, number, number] => [SHOP.x1 + 0.08, SIGN_Y + dy, dz];
    const stroke = (a: [number, number], b: [number, number]) => parts.push(rod(kit, N(...a), N(...b), TUBE, 'orange', { segments: 6, glow: 'orange' }), kit.sphere(TUBE, N(...a), 'orange', { detail: 0, glow: 'orange' }));
    const bowl: [number, number][] = [[0.02, -0.3], [-0.04, -0.24], [-0.09, -0.12], [-0.11, 0.0], [-0.09, 0.12], [-0.04, 0.24], [0.02, 0.3]];
    for (let i = 0; i < bowl.length - 1; i++) stroke(bowl[i]!, bowl[i + 1]!);
    stroke([0.02, -0.3], [0.02, 0.3]);
    stroke([0.02, 0.08], [0.1, 0.18]);
    stroke([0.02, 0.15], [0.1, 0.25]);
    stroke([0.05, -0.16], [0.11, -0.2]);

    // steaming pot cart
    parts.push(
      ...wheel(kit, { at: [CART.x, 0.16 + PAD, CART.z - 0.3], radius: 0.13, tube: 0.03, axis: 'z', color: 'charcoal', hubColor: 'stone', tubularSegments: 8 }),
      ...wheel(kit, { at: [CART.x, 0.16 + PAD, CART.z + 0.3], radius: 0.13, tube: 0.03, axis: 'z', color: 'charcoal', hubColor: 'stone', tubularSegments: 8 }),
      kit.box([0.5, 0.2, 0.46], [CART.x, PAD + 0.28, CART.z], 'wood'),
      kit.box([0.52, 0.04, 0.48], [CART.x, PAD + 0.4, CART.z], 'woodDark'),
      kit.box([0.04, 0.12, 0.3], [CART.x + 0.26, PAD + 0.28, CART.z], 'sunYellow'),
      kit.cylinder(0.17, 0.15, 0.2, [CART.x - 0.05, PAD + 0.52, CART.z], 'chrome', { segments: 12 }),
      kit.cylinder(0.12, 0.12, 0.02, [CART.x - 0.05, PAD + 0.63, CART.z], 'sunYellow', { segments: 12 }),
      kit.sphere(0.05, [CART.x - 0.05, PAD + 0.7, CART.z], 'white', { detail: 0, scale: [1.2, 1.4, 1.2] }),
      kit.sphere(0.04, [CART.x - 0.02, PAD + 0.82, CART.z + 0.04], 'white', { detail: 0, scale: [1.2, 1.4, 1.2] }),
      kit.sphere(0.03, [CART.x - 0.06, PAD + 0.92, CART.z - 0.02], 'white', { detail: 0, scale: [1.2, 1.4, 1.2] }),
      // lantern on a pole at the cart's corner
      kit.cylinder(0.02, 0.02, 0.8, [CART.x + 0.2, PAD + 0.8, CART.z + 0.2], 'woodDark', { segments: 6 }),
      kit.sphere(0.08, [CART.x + 0.2, PAD + 1.22, CART.z + 0.2], 'orange', { glow: 'lampWarm', light: 'breathe' }),
    );
    return kit.finish(parts);
  },
};
