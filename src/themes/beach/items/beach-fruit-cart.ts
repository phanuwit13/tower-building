import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod, wheel } from '../../../models/parts';

// A wooden fruit cart (long side along z, handles at -z) with a glass front, pineapples, watermelon halves and
// mangoes on the tray, and a red-and-white striped umbrella on a pole. Two wheels on an x axle.
const BODY = { w: 0.56, d: 1.0, h: 0.26, y: 0.3, z: 0.1 }; // the wooden box; y = its centre
const TOP = BODY.y + BODY.h / 2;
const POLE = { x: 0, z: 0.1, h: 0.62 };
const CANOPY = { r: 0.46, h: 0.24 };

/** รถเข็นผลไม้ชายหาด: a glass-box fruit cart under a striped umbrella. */
export const item: ItemModel = {
  id: 'beach-fruit-cart',
  name: 'รถเข็นผลไม้ชายหาด',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BODY.w, BODY.h, BODY.d], [0, BODY.y, BODY.z], 'wood'),
      kit.box([BODY.w + 0.04, 0.03, BODY.d + 0.04], [0, TOP + 0.015, BODY.z], 'woodDark'), // rim
      kit.box([BODY.w - 0.08, 0.02, BODY.d - 0.08], [0, TOP + 0.04, BODY.z], 'white'), // tray
      // wheels on the sides (axle along x), rolling along z
      ...wheel(kit, { at: [BODY.w / 2 + 0.01, 0.19, 0.3], radius: 0.15, tube: 0.04, axis: 'x', color: 'charcoal', hubColor: 'stoneDark', tubularSegments: 12 }),
      ...wheel(kit, { at: [-BODY.w / 2 - 0.01, 0.19, 0.3], radius: 0.15, tube: 0.04, axis: 'x', color: 'charcoal', hubColor: 'stoneDark', tubularSegments: 12 }),
      // the cart's legs at the handle end, and the two handles
      kit.box([0.05, 0.17, 0.05], [0.2, 0.085, -0.34], 'woodDark'),
      kit.box([0.05, 0.17, 0.05], [-0.2, 0.085, -0.34], 'woodDark'),
      rod(kit, [0.2, 0.38, -0.38], [0.2, 0.42, -0.95], 0.022, 'woodDark', { segments: 6 }),
      rod(kit, [-0.2, 0.38, -0.38], [-0.2, 0.42, -0.95], 0.022, 'woodDark', { segments: 6 }),
      // glass front (+x) and two glass ends, held by thin white posts at the corners
      kit.box([0.02, 0.2, BODY.d - 0.1], [BODY.w / 2 - 0.03, TOP + 0.13, BODY.z], 'glassBlue'),
    ];
    for (const sx of [1, -1]) for (const sz of [1, -1]) {
      parts.push(kit.box([0.03, 0.22, 0.03], [sx * (BODY.w / 2 - 0.03), TOP + 0.14, BODY.z + sz * (BODY.d / 2 - 0.05)], 'white'));
    }
    // fruit: pineapples (yellow with a leafy crown), watermelon halves, mangoes
    const y0 = TOP + 0.05;
    for (const x of [-0.12, 0.12]) {
      parts.push(
        kit.sphere(0.075, [x, y0 + 0.0975, -0.2], 'sunYellow', { scale: [1, 1.3, 1] }),
        kit.cone(0.04, 0.1, [x, y0 + 0.2, -0.2], 'leaf', { segments: 6 }),
        kit.dome(0.1, [x, y0 + 0.08, 0.4], 'leafDark', { segments: 8, scale: [1, -0.8, 1.1] }), // half a melon, cut face up
        kit.cylinder(0.088, 0.088, 0.012, [x, y0 + 0.086, 0.4], 'red', { segments: 8, scale: [1, 1, 1.1] }),
      );
    }
    for (const [x, z] of [[-0.15, 0.1], [0.15, 0.1], [0, -0.08], [0, 0.26]] as const) {
      parts.push(kit.sphere(0.055, [x, y0 + 0.05, z], 'orange', { detail: 0, scale: [1, 0.85, 1.15] }));
    }
    // umbrella: pole, two striped canopies half a segment apart and a cap
    parts.push(
      kit.cylinder(0.02, 0.02, POLE.h, [POLE.x, TOP + 0.03 + POLE.h / 2, POLE.z], 'white', { segments: 6 }),
      kit.cone(CANOPY.r, CANOPY.h, [POLE.x, TOP + 0.03 + POLE.h + CANOPY.h / 2, POLE.z], 'red', { segments: 6 }),
      kit.cone(CANOPY.r - 0.005, CANOPY.h - 0.005, [POLE.x, TOP + 0.03 + POLE.h + CANOPY.h / 2 - 0.0025, POLE.z], 'white', { segments: 6, rotate: [0, Math.PI / 6, 0] }),
      kit.sphere(0.03, [POLE.x, TOP + 0.03 + POLE.h + CANOPY.h + 0.02, POLE.z], 'sunYellow', { detail: 0 }),
    );
    return kit.finish(parts);
  },
};
