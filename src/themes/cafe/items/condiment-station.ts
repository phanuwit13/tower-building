import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Footprint 1x2 (x in [-0.5, 0.5], z in [-1, 1]). A small counter (top 0.62) with sugar jars, milk jugs,
// a napkin holder and a cup of coloured straws. Labels are colour bands only.
const TOP_Y = 0.62;

/** จุดเติมน้ำตาลและหลอด: small counter with sugar, milk jugs, napkins and straws. */
export const item: ItemModel = {
  id: 'condiment-station',
  name: 'จุดเติมน้ำตาลและหลอด',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.8, 0.04, 1.9], [0, 0.02, 0], 'woodDark'),
      kit.box([0.8, TOP_Y - 0.1, 1.9], [0, 0.04 + (TOP_Y - 0.1) / 2, 0], 'wood'),
      kit.box([0.86, 0.06, 1.96], [0, TOP_Y - 0.03, 0], 'white'),
      kit.box([0.02, 0.2, 1.7], [0.4, 0.3, 0], 'teal'),
      kit.box([0.62, 0.02, 1.7], [-0.02, TOP_Y + 0.01, 0], 'woodDark'), // tray
    ];
    // three sugar jars (glass body, white sugar, coloured lid)
    [[-0.1, -0.7, 'red'], [-0.1, -0.4, 'sunYellow'], [-0.1, -0.1, 'teal']].forEach(([x, z, c]) => {
      parts.push(
        kit.cylinder(0.1, 0.1, 0.16, [x as number, TOP_Y + 0.1, z as number], 'glassBlue', { segments: 8 }),
        kit.cylinder(0.085, 0.085, 0.11, [x as number, TOP_Y + 0.085, z as number], 'white', { segments: 8 }),
        kit.cylinder(0.105, 0.105, 0.04, [x as number, TOP_Y + 0.2, z as number], c as 'red', { segments: 8 }),
        kit.sphere(0.03, [x as number, TOP_Y + 0.24, z as number], c as 'red', { detail: 0 }),
      );
    });
    // two milk jugs with handles and a blue band
    for (const z of [0.25, 0.6]) {
      parts.push(
        kit.cylinder(0.08, 0.1, 0.2, [-0.1, TOP_Y + 0.12, z], 'white', { segments: 8 }),
        kit.cylinder(0.082, 0.092, 0.05, [-0.1, TOP_Y + 0.12, z], 'skyBlue', { segments: 8 }),
        kit.cylinder(0.07, 0.07, 0.015, [-0.1, TOP_Y + 0.225, z], 'white', { segments: 8 }),
        kit.torus(0.05, 0.016, [-0.1, TOP_Y + 0.13, z + 0.1], 'white', { radialSegments: 4, tubularSegments: 8, arc: Math.PI, rotate: [0, Math.PI / 2, -Math.PI / 2] }),
      );
    }
    // napkin holder: white box with napkin corners and a red stripe
    parts.push(
      kit.box([0.2, 0.12, 0.34], [0.25, TOP_Y + 0.08, 0.7], 'stoneDark'),
      kit.box([0.17, 0.05, 0.3], [0.25, TOP_Y + 0.165, 0.7], 'white'),
      kit.box([0.04, 0.03, 0.3], [0.25, TOP_Y + 0.2, 0.7], 'red'),
      kit.box([0.2, 0.12, 0.34], [0.25, TOP_Y + 0.08, 0.25], 'stoneDark'),
      kit.box([0.17, 0.05, 0.3], [0.25, TOP_Y + 0.165, 0.25], 'pink'),
    );
    // a cup of straws
    parts.push(kit.cylinder(0.09, 0.08, 0.14, [0.25, TOP_Y + 0.09, -0.4], 'skyBlue', { segments: 8 }));
    (['red', 'sunYellow', 'lime', 'pink', 'white', 'orange'] as const).forEach((c, i) => {
      const a = (i / 6) * Math.PI * 2;
      parts.push(kit.cylinder(0.012, 0.012, 0.2, [0.25 + Math.cos(a) * 0.04, TOP_Y + 0.25, -0.4 + Math.sin(a) * 0.04], c, { segments: 4, rotate: [Math.sin(a) * 0.2, 0, -Math.cos(a) * 0.2] }));
    });
    // wooden stirrers in a small cup, and a stack of lids
    parts.push(
      kit.cylinder(0.06, 0.05, 0.1, [0.25, TOP_Y + 0.07, -0.75], 'mint', { segments: 8 }),
      kit.cylinder(0.1, 0.1, 0.07, [0.25, TOP_Y + 0.045, -0.05], 'white', { segments: 10 }),
      kit.cylinder(0.1, 0.1, 0.012, [0.25, TOP_Y + 0.09, -0.05], 'stone', { segments: 10 }),
    );
    for (const dz of [-0.025, 0, 0.025]) parts.push(kit.box([0.012, 0.16, 0.012], [0.25, TOP_Y + 0.17, -0.75 + dz], 'sand', { rotate: [dz * 6, 0, dz * 4] }));
    return kit.finish(parts);
  },
};
