import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// A long wooden bar along z facing +x: espresso machine and grinder on the back half, cups along the front
// ledge, and three pendant lamps (breathing glow) hung from a rail held by two posts.
const TOP_Y = 0.62; // counter top surface
const BODY = { x: -0.3, w: 1.0, d: 2.8 }; // cabinet
const SLAB = { x: -0.2, w: 1.44, d: 2.84, t: 0.04 }; // top slab, overhangs 0.32 on the customer side
const RAIL_Y = 1.5;
const RAIL_X = -0.55;
const LAMP_Z = [-0.85, 0, 0.85] as const;
const SHADE = ['teal', 'sunYellow', 'red'] as const;
const BREATHE = { glow: true, light: 'breathe' } as const;

/** บาร์ชงกาแฟ: a long coffee bar with a machine, a grinder, cups and three pendant lamps. */
export const item: ItemModel = {
  id: 'barista-counter',
  name: 'บาร์ชงกาแฟ',
  category: 'food',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([BODY.w + 0.04, 0.04, BODY.d + 0.04], [BODY.x, 0.02, 0], 'woodDark'),
      kit.box([BODY.w, TOP_Y - SLAB.t - 0.04, BODY.d], [BODY.x, 0.04 + (TOP_Y - SLAB.t - 0.04) / 2, 0], 'wood'),
      kit.box([SLAB.w, SLAB.t, SLAB.d], [SLAB.x, TOP_Y - SLAB.t / 2, 0], 'woodDark'),
    ];
    // teal panels on the customer side
    for (const z of [-0.95, 0, 0.95]) parts.push(kit.box([0.02, 0.3, 0.8], [BODY.x + BODY.w / 2 + 0.01, 0.3, z], 'teal'));
    // ledge legs and a chrome footrest along z
    for (const z of [-1.3, 0, 1.3]) parts.push(kit.box([0.05, TOP_Y - SLAB.t, 0.05], [0.47, (TOP_Y - SLAB.t) / 2, z], 'woodDark'));
    parts.push(kit.cylinder(0.02, 0.02, 2.6, [0.47, 0.13, 0], 'chrome', { segments: 6, rotate: [Math.PI / 2, 0, 0] }));

    // espresso machine (back end)
    const mz = -0.9;
    parts.push(
      kit.box([0.4, 0.26, 0.62], [-0.5, TOP_Y + 0.13, mz], 'charcoal'),
      kit.box([0.43, 0.03, 0.65], [-0.5, TOP_Y + 0.275, mz], 'chrome'),
      kit.box([0.03, 0.05, 0.4], [-0.29, TOP_Y + 0.2, mz], 'red'),
      kit.box([0.14, 0.015, 0.5], [-0.24, TOP_Y + 0.008, mz], 'chrome'), // drip tray
      kit.cylinder(0.04, 0.04, 0.06, [-0.3, TOP_Y + 0.12, mz - 0.14], 'chrome', { segments: 8 }),
      kit.cylinder(0.04, 0.04, 0.06, [-0.3, TOP_Y + 0.12, mz + 0.14], 'chrome', { segments: 8 }),
      kit.cylinder(0.045, 0.04, 0.07, [-0.24, TOP_Y + 0.05, mz - 0.14], 'white', { segments: 8 }),
      kit.cylinder(0.045, 0.04, 0.07, [-0.24, TOP_Y + 0.05, mz + 0.14], 'sunYellow', { segments: 8 }),
      kit.sphere(0.03, [-0.55, TOP_Y + 0.31, mz + 0.2], 'redDark', { detail: 0 }),
    );
    // grinder
    const gz = -0.25;
    parts.push(
      kit.box([0.22, 0.2, 0.22], [-0.5, TOP_Y + 0.1, gz], 'red'),
      kit.cylinder(0.11, 0.05, 0.17, [-0.5, TOP_Y + 0.285, gz], 'glassBlue', { segments: 8 }),
      kit.cylinder(0.05, 0.11, 0.03, [-0.5, TOP_Y + 0.385, gz], 'charcoal', { segments: 8 }),
      kit.cylinder(0.04, 0.04, 0.06, [-0.35, TOP_Y + 0.03, gz], 'brass', { segments: 8 }),
    );
    // cups and a milk jug on the counter
    const cups: [number, number, 'white' | 'pink' | 'mint' | 'sunYellow'][] = [
      [0.28, -0.55, 'white'], [0.3, -0.2, 'pink'], [0.27, 0.35, 'mint'], [0.3, 0.7, 'sunYellow'], [0.22, 1.05, 'white'],
    ];
    for (const [x, z, c] of cups) parts.push(kit.cylinder(0.055, 0.045, 0.07, [x, TOP_Y + 0.035, z], c, { segments: 8 }));
    parts.push(
      kit.cylinder(0.06, 0.07, 0.12, [-0.45, TOP_Y + 0.06, 0.55], 'chrome', { segments: 8 }),
      kit.cylinder(0.08, 0.08, 0.04, [-0.1, TOP_Y + 0.02, 0.95], 'white', { segments: 10 }), // plate
      kit.sphere(0.045, [-0.1, TOP_Y + 0.07, 0.95], 'pink', { detail: 0 }),
    );

    // pendant lamps: two posts, a rail, cords, shades and glowing bulbs
    for (const z of [-1.3, 1.3]) parts.push(kit.box([0.06, RAIL_Y - TOP_Y, 0.06], [RAIL_X, (RAIL_Y + TOP_Y) / 2, z], 'woodDark'));
    parts.push(kit.box([0.06, 0.06, 2.68], [RAIL_X, RAIL_Y, 0], 'woodDark'));
    LAMP_Z.forEach((z, i) => {
      parts.push(
        kit.cylinder(0.014, 0.014, 0.22, [RAIL_X, RAIL_Y - 0.14, z], 'charcoal', { segments: 4 }),
        kit.cylinder(0.04, 0.17, 0.14, [RAIL_X, 1.2, z], SHADE[i], { segments: 10 }),
        kit.sphere(0.07, [RAIL_X, 1.1, z], 'lampWarm', { detail: 1, ...BREATHE }),
      );
    });
    return kit.finish(parts);
  },
};
