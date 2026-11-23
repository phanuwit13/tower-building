import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod, wheel } from '../../../models/parts';

// A push-cart (1×2, long side along z) with a charcoal grill in front, skewers of squid on the coals and a striped parasol behind.
const CART = { w: 0.62, d: 1.2, y0: 0.15, h: 0.3, z: 0 };
const GRILL = { w: 0.5, d: 0.62, z: 0.22 };
const SKEWER_Z = [-0.02, 0.15, 0.32, 0.49];
const COAL_TOP = CART.y0 + CART.h + 0.08 + 0.035;

/** ร้านปลาหมึกย่าง: a grilled-squid cart, skewers over glowing charcoal. */
export const item: ItemModel = {
  id: 'squid-grill',
  name: 'ร้านปลาหมึกย่าง',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const top = CART.y0 + CART.h;
    const parts: Part[] = [
      kit.box([CART.w, CART.h, CART.d], [0, CART.y0 + CART.h / 2, CART.z], 'red'),
      kit.box([CART.w + 0.04, 0.04, CART.d + 0.04], [0, top + 0.02, CART.z], 'white'),
      kit.box([CART.w + 0.01, 0.05, CART.d + 0.01], [0, CART.y0 + 0.07, CART.z], 'redDark'),
      // handles at the back (-z) and two little legs at the front
      kit.box([0.04, 0.04, 0.4], [-0.2, CART.y0 + 0.15, -0.8], 'wood'),
      kit.box([0.04, 0.04, 0.4], [0.2, CART.y0 + 0.15, -0.8], 'wood'),
      kit.box([0.06, CART.y0, 0.06], [-0.22, CART.y0 / 2, 0.5], 'woodDark'),
      kit.box([0.06, CART.y0, 0.06], [0.22, CART.y0 / 2, 0.5], 'woodDark'),
      // the grill tray and glowing charcoal
      kit.box([GRILL.w, 0.08, GRILL.d], [0, top + 0.04 + 0.04, GRILL.z], 'charcoal'),
      kit.box([GRILL.w - 0.08, 0.03, GRILL.d - 0.08], [0, top + 0.08 + 0.015 + 0.04 - 0.01, GRILL.z], 'orange', { glow: true, light: 'breathe' }),
      // a sauce bottle and a basket of squid at the back of the cart top
      kit.cylinder(0.04, 0.04, 0.16, [0.2, top + 0.04 + 0.08, -0.35], 'sunYellow', { segments: 8 }),
      kit.cylinder(0.04, 0.04, 0.16, [0.08, top + 0.04 + 0.08, -0.35], 'redDark', { segments: 8 }),
      kit.box([0.22, 0.1, 0.3], [-0.12, top + 0.04 + 0.05, -0.3], 'sand'),
      kit.sphere(0.06, [-0.12, top + 0.04 + 0.12, -0.3], 'pink', { detail: 0, scale: [1.2, 0.7, 1.4] }),
    ];
    // wheels (axle along x, on both sides)
    for (const sx of [-1, 1]) {
      parts.push(...wheel(kit, { at: [sx * (CART.w / 2 + 0.03), 0.19, -0.25], radius: 0.15, tube: 0.04, axis: 'x', color: 'charcoal', hubColor: 'stone' }));
    }
    // skewers along x with a squid on each: round body, a fin wedge at the tip and short tentacles
    for (const z of SKEWER_Z) {
      parts.push(
        rod(kit, [-0.26, COAL_TOP + 0.03, z], [0.26, COAL_TOP + 0.03, z], 0.012, 'woodDark', { segments: 4 }),
        kit.sphere(0.06, [0.1, COAL_TOP + 0.075, z], 'orange', { detail: 0, scale: [1.5, 0.9, 0.9] }),
        kit.cone(0.05, 0.1, [0.22, COAL_TOP + 0.075, z], 'redDark', { segments: 6, rotate: [0, 0, -Math.PI / 2] }),
        kit.box([0.1, 0.035, 0.05], [-0.04, COAL_TOP + 0.065, z], 'sand'),
        kit.box([0.08, 0.03, 0.04], [-0.16, COAL_TOP + 0.06, z], 'sand', { rotate: [0, 0.3, 0] }),
      );
    }
    // striped parasol over the cook's end
    parts.push(
      kit.cylinder(0.02, 0.02, 0.9, [0, CART.y0 + CART.h + 0.45, -0.38], 'white', { segments: 6 }),
      kit.cone(0.46, 0.2, [0, 1.22, -0.38], 'red', { segments: 6 }),
      kit.cone(0.46, 0.2, [0, 1.22, -0.38], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0], scale: [0.99, 1.01, 0.99] }),
    );
    return kit.finish(parts);
  },
};
