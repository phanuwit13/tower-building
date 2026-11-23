import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod, wheel } from '../../../models/parts';

// A push-cart (1×2, long side along z) with skewers of meatballs over glowing charcoal, a striped
// parasol and string bulbs under it.
const CART = { w: 0.5, d: 1.0, y0: 0.2, h: 0.28, z: 0.05 };
const TOP = CART.y0 + CART.h + 0.04; // top of the white cart lid
const TRAY = { w: 0.44, d: 0.5, z: 0.25 };
const COAL_TOP = TOP + 0.08 + 0.03;
const SKEWER_Z = [0.1, 0.22, 0.34, 0.46];
const BALL_X = [-0.15, -0.05, 0.05, 0.15];
const POLE_Z = -0.3;
const BULBS = 5;

/** แผงลูกชิ้นปิ้ง: a grilled-meatball cart, skewers over glowing charcoal. */
export const item: ItemModel = {
  id: 'meatball-grill',
  name: 'แผงลูกชิ้นปิ้ง',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([CART.w, CART.h, CART.d], [0, CART.y0 + CART.h / 2, CART.z], 'orange'),
      kit.box([CART.w + 0.04, 0.04, CART.d + 0.04], [0, CART.y0 + CART.h + 0.02, CART.z], 'white'),
      kit.box([CART.w + 0.01, 0.05, CART.d + 0.01], [0, CART.y0 + 0.07, CART.z], 'redDark'),
      // handles at the back (-z), legs at the front
      kit.box([0.04, 0.04, 0.4], [-0.18, CART.y0 + 0.15, -0.75], 'wood'),
      kit.box([0.04, 0.04, 0.4], [0.18, CART.y0 + 0.15, -0.75], 'wood'),
      kit.box([0.06, CART.y0, 0.06], [-0.2, CART.y0 / 2, 0.45], 'woodDark'),
      kit.box([0.06, CART.y0, 0.06], [0.2, CART.y0 / 2, 0.45], 'woodDark'),
      // charcoal tray with glowing coals
      kit.box([TRAY.w, 0.08, TRAY.d], [0, TOP + 0.04, TRAY.z], 'charcoal'),
      kit.box([TRAY.w - 0.08, 0.03, TRAY.d - 0.08], [0, TOP + 0.08 + 0.005, TRAY.z], 'orange', { glow: true, light: 'breathe' }),
      // sauce pots and a bowl of spare balls at the back of the lid
      kit.cylinder(0.05, 0.05, 0.1, [0.14, TOP + 0.05, -0.1], 'red', { segments: 8 }),
      kit.cylinder(0.05, 0.05, 0.1, [0.14, TOP + 0.05, -0.24], 'sunYellow', { segments: 8 }),
      kit.cylinder(0.09, 0.06, 0.08, [-0.1, TOP + 0.04, -0.15], 'white', { segments: 8 }),
      kit.sphere(0.07, [-0.1, TOP + 0.09, -0.15], 'wood', { detail: 0 }),
    ];
    for (const sx of [-1, 1]) {
      parts.push(...wheel(kit, { at: [sx * (CART.w / 2 + 0.03), 0.19, -0.3], radius: 0.15, tube: 0.04, axis: 'x', color: 'charcoal', hubColor: 'stone' }));
    }
    // skewers along x with four meatballs each
    for (const z of SKEWER_Z) {
      parts.push(rod(kit, [-0.23, COAL_TOP + 0.03, z], [0.23, COAL_TOP + 0.03, z], 0.012, 'woodDark', { segments: 4 }));
      BALL_X.forEach((x, i) => parts.push(kit.sphere(0.05, [x, COAL_TOP + 0.03 + 0.04, z], i % 2 === 0 ? 'wood' : 'woodDark', { detail: 0 })));
    }
    // parasol over the cook's end, string bulbs round its rim
    const canopyY = 1.2;
    parts.push(
      kit.cylinder(0.02, 0.02, canopyY - TOP, [0, (TOP + canopyY) / 2, POLE_Z], 'white', { segments: 6 }),
      kit.cone(0.46, 0.2, [0, canopyY, POLE_Z], 'sunYellow', { segments: 6 }),
      kit.cone(0.46, 0.2, [0, canopyY, POLE_Z], 'red', { segments: 6, rotate: [0, Math.PI / 6, 0], scale: [0.99, 1.01, 0.99] }),
      kit.sphere(0.06, [0, canopyY + 0.14, POLE_Z], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }),
    );
    for (let i = 0; i < BULBS; i++) {
      const a = (i / BULBS) * Math.PI * 2 + 0.3;
      parts.push(kit.sphere(0.035, [0.4 * Math.cos(a), canopyY - 0.12, POLE_Z + 0.4 * Math.sin(a)], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }));
    }
    return kit.finish(parts);
  },
};
