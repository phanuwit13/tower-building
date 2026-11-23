import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Footprint 2x2. A tall back shelf (x = -0.8) with tiers of baskets, and a low display table in front
// (front faces +x) with baskets, croissants, baguettes and loaves seen from above.
const TABLE_Y = 0.5;
type Bread = 'sunYellow' | 'orange' | 'sand' | 'wood';

/** ชั้นขนมปัง: wooden shelves with baskets of bread, croissants and baguettes. */
export const item: ItemModel = {
  id: 'bread-shelf',
  name: 'ชั้นขนมปัง',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    // low table in front
    parts.push(
      kit.box([1.0, TABLE_Y - 0.05, 1.9], [0.45, (TABLE_Y - 0.05) / 2, 0], 'wood'),
      kit.box([1.04, 0.05, 1.94], [0.45, TABLE_Y - 0.025, 0], 'woodDark'),
      kit.box([1.04, 0.1, 1.94], [0.45, 0.05, 0], 'woodDark'),
      kit.box([0.9, 0.02, 1.8], [0.45, TABLE_Y + 0.01, 0], 'cream'),
    );
    // round baskets of loaves (z = -0.62, 0.0 on the table front column)
    const basket = (x: number, y: number, z: number, r: number) => {
      parts.push(
        kit.cylinder(r, r * 0.85, 0.1, [x, y + 0.05, z], 'wood', { segments: 8 }),
        kit.cylinder(r * 0.9, r * 0.9, 0.02, [x, y + 0.095, z], 'sand', { segments: 8 }),
      );
    };
    const loaf = (x: number, y: number, z: number, c: Bread, s: [number, number, number] = [1, 0.75, 1.25], rot = 0) =>
      parts.push(kit.sphere(0.075, [x, y, z], c, { detail: 0, scale: s, rotate: [0, rot, 0] }));

    basket(0.7, TABLE_Y + 0.02, -0.6, 0.2);
    loaf(0.7, TABLE_Y + 0.14, -0.6, 'sunYellow', [1.2, 0.9, 1.2]);
    loaf(0.78, TABLE_Y + 0.14, -0.52, 'orange', [1, 0.8, 1]);
    loaf(0.62, TABLE_Y + 0.14, -0.68, 'sand', [1, 0.8, 1]);
    // basket of croissants: crescents (orange arcs)
    basket(0.7, TABLE_Y + 0.02, 0.0, 0.2);
    for (const [dx, dz, rot] of [[-0.06, -0.06, 0], [0.06, 0.05, 2.2], [-0.04, 0.08, 4]] as const) {
      parts.push(kit.torus(0.07, 0.045, [0.7 + dx, TABLE_Y + 0.14, dz], 'orange', { radialSegments: 4, tubularSegments: 8, arc: Math.PI * 1.4, rotate: [Math.PI / 2, rot, 0] }));
    }
    // basket of round rolls
    basket(0.7, TABLE_Y + 0.02, 0.62, 0.2);
    loaf(0.66, TABLE_Y + 0.14, 0.58, 'sand', [1, 0.8, 1]);
    loaf(0.76, TABLE_Y + 0.14, 0.66, 'sunYellow', [1, 0.8, 1]);
    loaf(0.64, TABLE_Y + 0.14, 0.69, 'orange', [0.9, 0.8, 0.9]);
    // a long tray of baguettes along z
    parts.push(kit.box([0.3, 0.04, 1.7], [0.2, TABLE_Y + 0.04, 0], 'woodDark'));
    for (const x of [0.12, 0.2, 0.28]) {
      parts.push(kit.cylinder(0.04, 0.04, 1.5, [x, TABLE_Y + 0.09, 0], x === 0.2 ? 'sunYellow' : 'orange', { segments: 6, rotate: [Math.PI / 2, 0, 0] }));
    }
    // back: tall shelf unit with two tiers of baskets
    parts.push(
      kit.box([0.4, 0.06, 1.94], [-0.78, 0.03, 0], 'woodDark'),
      kit.box([0.04, 1.2, 1.94], [-0.97, 0.6, 0], 'wood'),
      kit.box([0.4, 0.04, 1.94], [-0.78, 1.22, 0], 'woodDark'),
    );
    for (const z of [-0.95, 0.95]) parts.push(kit.box([0.4, 1.2, 0.04], [-0.78, 0.6, z], 'wood'));
    for (const y of [0.45, 0.82]) {
      parts.push(kit.box([0.4, 0.04, 1.9], [-0.78, y, 0], 'wood'));
      const cols: Bread[] = ['sunYellow', 'orange', 'sand'];
      [-0.6, 0, 0.6].forEach((z, i) => {
        basket(-0.74, y + 0.02, z, 0.17);
        loaf(-0.74, y + 0.14, z, cols[(i + (y > 0.6 ? 1 : 0)) % 3], [1.1, 0.9, 1.1]);
        loaf(-0.68, y + 0.13, z + 0.06, cols[(i + 1) % 3], [0.8, 0.7, 0.8]);
      });
    }
    // top shelf: baguettes standing in a pot
    parts.push(kit.cylinder(0.14, 0.12, 0.16, [-0.78, 1.32, 0.0], 'terracotta', { segments: 8 }));
    for (const [dx, dz] of [[-0.04, -0.03], [0.04, 0.02], [0, 0.06], [0.0, -0.07]] as const) {
      parts.push(kit.cylinder(0.035, 0.035, 0.3, [-0.78 + dx, 1.42, dz], 'sunYellow', { segments: 6 }));
    }
    return kit.finish(parts);
  },
};
