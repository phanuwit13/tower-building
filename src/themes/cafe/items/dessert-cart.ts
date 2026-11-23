import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Pastel two-shelf cart (1×2, long side along z), handle at the -x side, sweets on the +x-facing top.
const TOP_Y = 0.62;
const LOW_Y = 0.3;
const L = 1.4; // shelf length along z
const W = 0.6;
const SWEET = ['pink', 'mint', 'sunYellow', 'purple', 'orange'] as const;

/** รถเข็นขนมหวาน: a pastel cart with macarons, cupcakes and jars of candy. */
export const item: ItemModel = {
  id: 'dessert-cart',
  name: 'รถเข็นขนมหวาน',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      parts.push(kit.box([0.04, TOP_Y, 0.04], [sx * (W / 2 - 0.04), TOP_Y / 2 + 0.1, sz * (L / 2 - 0.04)], 'white'));
    }
    parts.push(
      kit.box([W, 0.05, L], [0, TOP_Y + 0.1 - 0.025 + 0.025, 0], 'pink'),
      kit.box([W - 0.04, 0.04, L - 0.04], [0, LOW_Y, 0], 'mint'),
      kit.box([0.03, 0.12, L], [W / 2 - 0.02, LOW_Y + 0.08, 0], 'mint'), // low shelf rail
      kit.box([0.03, 0.04, L], [W / 2 + 0.0, TOP_Y + 0.1 + 0.045, 0], 'white'), // top rail (front)
      kit.box([0.03, 0.04, L], [-W / 2, TOP_Y + 0.1 + 0.045, 0], 'white'),
      kit.cylinder(0.02, 0.02, 0.42, [-W / 2 - 0.1, 0.9, 0], 'brass', { segments: 8, rotate: [Math.PI / 2, 0, 0] }), // push handle
    );
    for (const sz of [-1, 1]) parts.push(kit.cylinder(0.015, 0.015, 0.14, [-W / 2 - 0.05, 0.84, sz * 0.2], 'brass', { segments: 6, rotate: [0, 0, Math.PI / 2] }));
    // wheels (axle along x)
    for (const sz of [-1, 1]) for (const sx of [-1, 1]) {
      parts.push(kit.cylinder(0.1, 0.1, 0.05, [sx * (W / 2 + 0.0), 0.1, sz * 0.5], 'charcoal', { segments: 12, rotate: [0, 0, Math.PI / 2] }));
    }
    const top = TOP_Y + 0.1 + 0.025;
    // top: a row of macarons stacked, three cupcakes, and candy jars
    for (let i = 0; i < 3; i++) {
      const z = -0.55;
      parts.push(
        kit.cylinder(0.075, 0.075, 0.03, [0.15, top + 0.015 + i * 0.07, z + (i % 2) * 0.03], SWEET[i], { segments: 12 }),
        kit.cylinder(0.065, 0.065, 0.025, [0.15, top + 0.04 + i * 0.07, z + (i % 2) * 0.03], 'white', { segments: 12 }),
      );
    }
    for (let i = 0; i < 3; i++) {
      const z = -0.15 + i * 0.17;
      parts.push(
        kit.cylinder(0.07, 0.05, 0.08, [0.1, top + 0.04, z], SWEET[(i + 1) % 5], { segments: 8 }),
        kit.sphere(0.075, [0.1, top + 0.12, z], 'white', { scale: [1, 0.8, 1] }),
        kit.sphere(0.025, [0.1, top + 0.19, z], 'red', { detail: 0 }),
      );
    }
    for (const [i, z] of [0.5, 0.68].entries()) {
      parts.push(
        kit.cylinder(0.09, 0.09, 0.2, [0.0, top + 0.1, z], 'glassBlue', { segments: 12 }),
        kit.cylinder(0.1, 0.1, 0.03, [0.0, top + 0.215, z], 'pink', { segments: 12 }),
        kit.sphere(0.07, [0.0, top + 0.12, z], SWEET[(i * 2 + 1) % 5], { detail: 1, scale: [1, 1, 1] }),
      );
    }
    // lower shelf: stacked sweet boxes and a cake dome
    parts.push(
      kit.box([0.22, 0.1, 0.3], [0.0, LOW_Y + 0.07, -0.45], 'pink'),
      kit.box([0.18, 0.1, 0.26], [0.0, LOW_Y + 0.17, -0.45], 'mint'),
      kit.dome(0.2, [0.0, LOW_Y + 0.02, 0.25], 'glassBlue', { segments: 12 }),
      kit.cylinder(0.14, 0.14, 0.06, [0.0, LOW_Y + 0.05, 0.25], 'sunYellow', { segments: 12 }),
    );
    return kit.finish(parts);
  },
};
