import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Footprint 2x3: x in [-1, 1], z in [-1.5, 1.5]. A steel counter (front faces +x) with a stove at the -z end,
// a prep area at the +z end, a hood and a back unit of plate shelves.
const TOP_Y = 0.62; // counter surface
const COUNTER = { x0: -0.6, x1: 0.95, z: 1.45 };
const CX = (COUNTER.x0 + COUNTER.x1) / 2;
const CW = COUNTER.x1 - COUNTER.x0;

/** ครัวเปิด: steel counter with a stove, pots, a hood and shelves of plates; the burners glow. */
export const item: ItemModel = {
  id: 'open-kitchen',
  name: 'ครัวเปิด',
  category: 'food',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      // counter body, steel top, plinth and front handles
      kit.box([CW, 0.04, 2 * COUNTER.z], [CX, 0.02, 0], 'charcoal'),
      kit.box([CW, TOP_Y - 0.1, 2 * COUNTER.z], [CX, 0.04 + (TOP_Y - 0.1) / 2, 0], 'stone'),
      kit.box([CW + 0.02, 0.06, 2 * COUNTER.z + 0.02], [CX, TOP_Y - 0.03, 0], 'chrome'),
    ];
    for (const z of [-1.0, -0.35, 0.3, 0.95]) {
      parts.push(kit.box([0.02, 0.05, 0.4], [COUNTER.x1 + 0.01, 0.38, z], 'charcoal'));
    }
    for (const z of [-0.025, 0.625]) parts.push(kit.box([0.01, 0.34, 0.01], [COUNTER.x1 + 0.005, 0.3, z], 'stoneDark'));
    for (const z of [-1.3, -0.65, 0]) parts.push(kit.sphere(0.035, [COUNTER.x1 + 0.01, 0.5, z], 'red', { detail: 0 }));

    // back unit: a tall wall with plate shelves (the hood takes the stove end)
    const BX = -0.82;
    parts.push(
      kit.box([0.36, 1.35, 2.9], [BX, 0.675, 0], 'woodDark'),
      kit.box([0.04, 1.35, 2.9], [-0.64, 0.675, 0], 'wood'),
    );
    // stove hood: a chrome box in front of the wall, with a flue
    parts.push(
      kit.box([0.5, 0.3, 1.5], [-0.42, 1.25, -0.7], 'chrome'),
      kit.box([0.5, 0.06, 1.5], [-0.42, 1.1, -0.7], 'stoneDark'),
      kit.box([0.2, 0.2, 0.3], [-0.5, 1.5, -0.7], 'chrome'),
    );
    // shelves of plates and cups along z > 0.05
    for (const y of [0.85, 1.12]) {
      parts.push(kit.box([0.28, 0.03, 1.4], [-0.56, y, 0.8], 'wood'));
      const cols = ['white', 'mint', 'pink', 'skyBlue', 'sunYellow', 'white'] as const; // 6 plates a shelf
      cols.forEach((c, i) => {
        const z = 0.25 + i * 0.22;
        parts.push(kit.cylinder(0.09, 0.08, 0.06, [-0.56, y + 0.045, z], c, { segments: 8 }));
      });
    }
    parts.push(kit.box([0.28, 0.03, 1.4], [-0.56, 1.39, 0.8], 'wood'));
    for (let i = 0; i < 5; i++) {
      parts.push(kit.cylinder(0.05, 0.04, 0.09, [-0.56, 1.46, 0.25 + i * 0.28], (['red', 'sunYellow', 'teal', 'pink', 'orange'] as const)[i], { segments: 8 }));
    }

    // stove: 4 burners that glow (rings of red / orange) in two columns, pots on two of them
    const burner = (x: number, z: number, c: 'red' | 'orange') => {
      parts.push(
        kit.cylinder(0.16, 0.16, 0.02, [x, TOP_Y + 0.01, z], 'charcoal', { segments: 8 }),
        kit.torus(0.115, 0.03, [x, TOP_Y + 0.035, z], c, { radialSegments: 4, tubularSegments: 8, rotate: [Math.PI / 2, 0, 0], glow: true, light: 'breathe' }),
      );
    };
    burner(0.0, -1.15, 'red');
    burner(0.5, -1.15, 'orange');
    burner(0.0, -0.55, 'orange');
    burner(0.5, -0.55, 'red');
    // a big red stock pot with a lid, and a yellow soup pot
    parts.push(
      kit.cylinder(0.18, 0.17, 0.18, [0.0, TOP_Y + 0.12, -1.15], 'red', { segments: 10 }),
      kit.cylinder(0.19, 0.19, 0.03, [0.0, TOP_Y + 0.225, -1.15], 'redDark', { segments: 10 }),
      kit.sphere(0.035, [0.0, TOP_Y + 0.27, -1.15], 'sunYellow', { detail: 0 }),
      kit.box([0.1, 0.03, 0.04], [0.0, TOP_Y + 0.17, -1.15 + 0.22], 'charcoal'),
      kit.cylinder(0.17, 0.16, 0.14, [0.5, TOP_Y + 0.1, -0.55], 'chrome', { segments: 10 }),
      kit.cylinder(0.145, 0.145, 0.02, [0.5, TOP_Y + 0.17, -0.55], 'orange', { segments: 10 }),
      kit.box([0.14, 0.03, 0.04], [0.5 + 0.2, TOP_Y + 0.14, -0.55], 'charcoal'),
    );
    // a flat pan on the third burner
    parts.push(
      kit.cylinder(0.17, 0.15, 0.04, [0.0, TOP_Y + 0.05, -0.55], 'charcoal', { segments: 10 }),
      kit.cylinder(0.13, 0.13, 0.01, [0.0, TOP_Y + 0.072, -0.55], 'sand', { segments: 10 }),
      kit.box([0.22, 0.025, 0.04], [0.28, TOP_Y + 0.06, -0.55], 'woodDark'),
    );

    // prep area: cutting board, a bowl of fruit, a tray of golden rolls
    parts.push(
      kit.box([0.42, 0.03, 0.6], [0.25, TOP_Y + 0.015, 0.55], 'wood'),
      kit.sphere(0.07, [0.2, TOP_Y + 0.1, 0.4], 'red', { detail: 0 }),
      kit.sphere(0.06, [0.3, TOP_Y + 0.09, 0.55], 'lime', { detail: 0 }),
      kit.sphere(0.06, [0.18, TOP_Y + 0.09, 0.68], 'orange', { detail: 0 }),
      kit.cylinder(0.16, 0.11, 0.12, [0.1, TOP_Y + 0.06, 1.1], 'mint', { segments: 10 }),
      kit.sphere(0.075, [0.1, TOP_Y + 0.15, 1.1], 'red', { detail: 0 }),
      kit.sphere(0.07, [0.14, TOP_Y + 0.16, 1.06], 'sunYellow', { detail: 0 }),
      kit.sphere(0.06, [0.05, TOP_Y + 0.15, 1.13], 'lime', { detail: 0 }),
      kit.box([0.34, 0.025, 0.4], [0.62, TOP_Y + 0.0125, 1.1], 'chrome'),
      kit.sphere(0.07, [0.62, TOP_Y + 0.08, 0.98], 'sunYellow', { detail: 0, scale: [1, 0.7, 1.3] }),
      kit.sphere(0.07, [0.62, TOP_Y + 0.08, 1.12], 'orange', { detail: 0, scale: [1, 0.7, 1.3] }),
      kit.sphere(0.07, [0.62, TOP_Y + 0.08, 1.26], 'sunYellow', { detail: 0, scale: [1, 0.7, 1.3] }),
    );
    return kit.finish(parts);
  },
};
