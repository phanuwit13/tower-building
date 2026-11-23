import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Footprint 1x2 (x in [-0.5, 0.5], z in [-1, 1]). A dining table (top 0.50) with a pink cloth, a teapot,
// cups on saucers and a three-tier cake stand.
const TOP_Y = 0.5;

/** โต๊ะน้ำชา: table with a teapot, cups and a three-tier cake stand. */
export const item: ItemModel = {
  id: 'tea-party-table',
  name: 'โต๊ะน้ำชา',
  category: 'food',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.92, 0.05, 1.84], [0, TOP_Y - 0.025, 0], 'woodDark'),
      kit.box([0.96, 0.02, 1.88], [0, TOP_Y + 0.01, 0], 'pink'),
      kit.box([0.2, 0.022, 1.88], [0, TOP_Y + 0.011, 0], 'white'),
      // cloth hem
      kit.box([0.98, 0.1, 0.02], [0, TOP_Y - 0.04, 0.95], 'pink'),
      kit.box([0.98, 0.1, 0.02], [0, TOP_Y - 0.04, -0.95], 'pink'),
    ];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      parts.push(kit.box([0.07, TOP_Y - 0.05, 0.07], [sx * 0.4, (TOP_Y - 0.05) / 2, sz * 0.85], 'wood'));
    }
    // teapot at the -z end: round body, lid, spout, handle
    const tz = -0.62;
    parts.push(
      kit.sphere(0.14, [0, TOP_Y + 0.2, tz], 'skyBlue', { scale: [1, 0.85, 1] }),
      kit.cylinder(0.1, 0.1, 0.03, [0, TOP_Y + 0.035, tz], 'blue', { segments: 8 }),
      kit.dome(0.075, [0, TOP_Y + 0.29, tz], 'blue', { segments: 8 }),
      kit.sphere(0.025, [0, TOP_Y + 0.37, tz], 'sunYellow', { detail: 0 }),
      kit.cone(0.04, 0.2, [0.2, TOP_Y + 0.26, tz], 'skyBlue', { segments: 8, rotate: [0, 0, -1.0] }),
      kit.torus(0.075, 0.022, [-0.15, TOP_Y + 0.2, tz], 'blue', { radialSegments: 4, tubularSegments: 8, arc: Math.PI * 1.2, rotate: [0, 0, Math.PI * 0.9] }),
    );
    // four cups on saucers
    [[0.2, -0.15], [-0.2, -0.15], [0.2, 0.2], [-0.2, 0.2]].forEach(([x, z], i) => {
      const c = (['red', 'sunYellow', 'mint', 'purple'] as const)[i];
      parts.push(
        kit.cylinder(0.1, 0.09, 0.02, [x, TOP_Y + 0.03, z], 'white', { segments: 8 }),
        kit.cylinder(0.065, 0.05, 0.06, [x, TOP_Y + 0.07, z], c, { segments: 8 }),
        kit.cylinder(0.052, 0.052, 0.012, [x, TOP_Y + 0.1, z], 'bark', { segments: 8 }),
        kit.box([0.03, 0.025, 0.02], [x + (x > 0 ? 0.075 : -0.075), TOP_Y + 0.075, z], c),
      );
    });
    // three-tier cake stand at the +z end
    const cz = 0.68;
    parts.push(
      kit.cylinder(0.025, 0.025, 0.55, [0, TOP_Y + 0.28, cz], 'chrome', { segments: 6 }),
      kit.cylinder(0.2, 0.2, 0.03, [0, TOP_Y + 0.035, cz], 'white', { segments: 10 }),
      kit.cylinder(0.15, 0.15, 0.03, [0, TOP_Y + 0.25, cz], 'mint', { segments: 10 }),
      kit.cylinder(0.1, 0.1, 0.03, [0, TOP_Y + 0.43, cz], 'pink', { segments: 8 }),
      kit.sphere(0.03, [0, TOP_Y + 0.58, cz], 'red', { detail: 0 }),
    );
    // bottom tier: cupcakes
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const x = Math.cos(a) * 0.12;
      const z = cz + Math.sin(a) * 0.12;
      parts.push(
        kit.cylinder(0.045, 0.035, 0.05, [x, TOP_Y + 0.075, z], i % 2 ? 'terracotta' : 'sunYellow', { segments: 8 }),
        kit.dome(0.05, [x, TOP_Y + 0.1, z], (['pink', 'white', 'lime', 'purple'] as const)[i], { segments: 8 }),
      );
    }
    // middle tier: macarons; top tier: a little cake with a cherry
    (['pink', 'lime', 'sunYellow', 'purple', 'orange'] as const).forEach((c, i) => {
      const a = (i / 5) * Math.PI * 2;
      parts.push(kit.cylinder(0.04, 0.04, 0.04, [Math.cos(a) * 0.09, TOP_Y + 0.29, cz + Math.sin(a) * 0.09], c, { segments: 8 }));
    });
    parts.push(
      kit.cylinder(0.065, 0.065, 0.07, [0, TOP_Y + 0.485, cz], 'cream', { segments: 8 }),
      kit.dome(0.065, [0, TOP_Y + 0.52, cz], 'pink', { segments: 8 }),
    );
    return kit.finish(parts);
  },
};
