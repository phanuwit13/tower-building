import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

// An old-style coffee stall: a counter with a cloth filter pot and glass jars under a small tarp, and a
// round table with stools in front. The lamp over the counter breathes at night.
const COUNTER = { x: -0.45, w: 0.5, d: 1.5, h: 0.62 };
const TABLE = { x: 0.4, z: 0, y: 0.5, r: 0.3 };
const STOOL_Y = 0.31;

function stool(kit: StyleKit, x: number, z: number): Part[] {
  return [
    kit.cylinder(0.15, 0.15, 0.05, [x, STOOL_Y - 0.025, z], 'wood', { segments: 8 }),
    kit.cylinder(0.04, 0.06, STOOL_Y - 0.05, [x, (STOOL_Y - 0.05) / 2, z], 'woodDark', { segments: 6 }),
  ];
}

/** ร้านกาแฟโบราณ: a coffee stall with a cloth filter pot, glass jars, stools and a lamp. */
export const item: ItemModel = {
  id: 'coffee-stall',
  name: 'ร้านกาแฟโบราณ',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const top = COUNTER.h;
    const parts: Part[] = [
      kit.box([COUNTER.w, top - 0.04, COUNTER.d], [COUNTER.x, (top - 0.04) / 2, 0], 'wood'),
      kit.box([COUNTER.w + 0.06, 0.04, COUNTER.d + 0.06], [COUNTER.x, top - 0.02, 0], 'woodDark'),
      // shelf board behind the counter
      kit.box([0.04, 0.8, 1.5], [-0.9, 0.4, 0], 'woodDark'),
    ];
    // posts and a small striped tarp over the counter
    for (const z of [-0.78, 0.78]) {
      parts.push(
        kit.cylinder(0.03, 0.03, 1.5, [-0.85, 0.75, z], 'woodDark', { segments: 6 }),
        kit.cylinder(0.03, 0.03, 1.36, [-0.62, 0.68, z], 'woodDark', { segments: 6 }),
      );
    }
    for (let i = 0; i < 5; i++) {
      parts.push(kit.box([0.4, 0.04, 0.34], [-0.78, 1.5, -0.68 + 0.34 * i], i % 2 === 0 ? 'teal' : 'white', { rotate: [0, 0, -0.16] }));
    }
    // cloth filter pot on a stand: a metal pot, a cloth sock hanging in it, a cup under the spout
    parts.push(
      kit.cylinder(0.14, 0.11, 0.24, [-0.45, top + 0.12, -0.45], 'chrome', { segments: 10 }),
      kit.cylinder(0.07, 0.015, 0.2, [-0.45, top + 0.34, -0.45], 'cream', { segments: 8 }),
      kit.torus(0.07, 0.015, [-0.45, top + 0.44, -0.45], 'woodDark', { radialSegments: 4, tubularSegments: 8, rotate: [Math.PI / 2, 0, 0] }),
      kit.box([0.04, 0.2, 0.04], [-0.45, top + 0.38, -0.45 - 0.16], 'woodDark'),
      kit.cylinder(0.06, 0.045, 0.07, [-0.3, top + 0.04, -0.2], 'white', { segments: 8 }),
      kit.cylinder(0.06, 0.045, 0.07, [-0.3, top + 0.04, -0.05], 'white', { segments: 8 }),
    );
    // glass jars with biscuits and sweets
    const jars = ['sunYellow', 'pink', 'cream', 'orange'] as const;
    jars.forEach((c, i) => {
      const z = 0.1 + i * 0.16;
      parts.push(
        kit.cylinder(0.065, 0.065, 0.17, [-0.5, top + 0.085, z], 'glassBlue', { segments: 8 }),
        kit.cylinder(0.05, 0.05, 0.1, [-0.5, top + 0.06, z], c, { segments: 8 }),
        kit.cylinder(0.07, 0.07, 0.03, [-0.5, top + 0.185, z], 'red', { segments: 8 }),
      );
    });
    // hanging lamp
    parts.push(
      kit.box([0.4, 0.03, 0.04], [-0.42, 1.4, 0], 'woodDark'),
      kit.cylinder(0.012, 0.012, 0.16, [-0.24, 1.32, 0], 'charcoal', { segments: 4 }),
      kit.sphere(0.09, [-0.24, 1.17, 0], 'lampWarm', { glow: true, light: 'breathe' }),
    );
    // round table, stools and cups
    parts.push(
      kit.cylinder(TABLE.r, TABLE.r, 0.04, [TABLE.x, TABLE.y - 0.02, TABLE.z], 'woodDark', { segments: 12 }),
      kit.cylinder(0.05, 0.08, TABLE.y - 0.04, [TABLE.x, (TABLE.y - 0.04) / 2, TABLE.z], 'wood', { segments: 6 }),
      kit.cylinder(0.045, 0.035, 0.06, [TABLE.x - 0.1, TABLE.y + 0.03, TABLE.z - 0.08], 'white', { segments: 8 }),
      kit.cylinder(0.045, 0.035, 0.06, [TABLE.x + 0.08, TABLE.y + 0.03, TABLE.z + 0.1], 'white', { segments: 8 }),
      kit.sphere(0.07, [TABLE.x + 0.08, TABLE.y + 0.09, TABLE.z - 0.1], 'red', { detail: 0, scale: [1, 0.9, 1] }),
    );
    for (const [x, z] of [[TABLE.x, -0.66], [TABLE.x, 0.66], [0.82, 0]]) parts.push(...stool(kit, x, z));
    return kit.finish(parts);
  },
};
