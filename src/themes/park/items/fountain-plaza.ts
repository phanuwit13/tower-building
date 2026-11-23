import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// 2×3. A round tiered fountain in the middle of a paved plaza, a bench at each end and flower tubs in the corners.
const PAVE = 0.04;
const BASIN = { r: 0.8, rim: 0.2 };
const POOL: MotionOpts = { kind: 'water', water: 'pool' };
const BENCH_Z = 1.26;
const TUBS: Array<[number, number]> = [[0.78, 1.3], [-0.78, 1.3], [0.78, -1.3], [-0.78, -1.3]];
const FLOWER_COLOURS: PaletteColor[] = ['pink', 'sunYellow', 'red', 'purple'];

/** ลานน้ำพุ: a plaza with a round tiered fountain, benches and flower tubs. */
export const item: ItemModel = {
  id: 'fountain-plaza',
  name: 'ลานน้ำพุ',
  category: 'decoration',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.98, PAVE, 2.98], [0, PAVE / 2, 0], 'stone'),
      // a paler paving ring round the fountain and a path of tiles to each bench
      kit.cylinder(1.0, 1.0, 0.012, [0, PAVE + 0.006, 0], 'cream', { segments: 16 }),
      kit.box([0.5, 0.012, 0.5], [0, PAVE + 0.006, BENCH_Z - 0.1], 'cream'),
      kit.box([0.5, 0.012, 0.5], [0, PAVE + 0.006, -BENCH_Z + 0.1], 'cream'),
    ];
    // basin: a solid white drum, pool water on top, a stone rim ring round the water
    const baseY = PAVE;
    parts.push(
      kit.cylinder(BASIN.r, BASIN.r + 0.02, BASIN.rim - 0.04, [0, baseY + (BASIN.rim - 0.04) / 2, 0], 'white', { segments: 16 }),
      kit.cylinder(BASIN.r - 0.06, BASIN.r - 0.06, BASIN.rim - 0.02, [0, baseY + (BASIN.rim - 0.02) / 2, 0], 'skyBlue', { segments: 16, motion: POOL }),
      kit.torus(BASIN.r - 0.03, 0.05, [0, baseY + BASIN.rim + 0.01, 0], 'stone', { radialSegments: 6, tubularSegments: 16, rotate: [Math.PI / 2, 0, 0] }),
    );
    // tiers: pedestal, lower bowl, stem, upper bowl, finial and spray
    const y0 = baseY + BASIN.rim - 0.02;
    parts.push(
      kit.cylinder(0.14, 0.2, 0.34, [0, y0 + 0.17, 0], 'stone', { segments: 12 }),
      kit.cylinder(0.42, 0.22, 0.12, [0, y0 + 0.4, 0], 'white', { segments: 12 }),
      kit.cylinder(0.36, 0.36, 0.03, [0, y0 + 0.465, 0], 'skyBlue', { segments: 12, motion: POOL }),
      kit.cylinder(0.08, 0.1, 0.3, [0, y0 + 0.6, 0], 'stone', { segments: 8 }),
      kit.cylinder(0.24, 0.12, 0.09, [0, y0 + 0.78, 0], 'white', { segments: 12 }),
      kit.cylinder(0.2, 0.2, 0.02, [0, y0 + 0.83, 0], 'skyBlue', { segments: 12, motion: POOL }),
      kit.sphere(0.07, [0, y0 + 0.9, 0], 'sunYellow', { detail: 0 }),
      kit.cone(0.05, 0.22, [0, y0 + 1.02, 0], 'glassBlue', { segments: 6 }),
    );
    // water falling from the upper bowl, as thin pale strands
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      parts.push(kit.cylinder(0.012, 0.012, 0.3, [0.27 * Math.cos(a), y0 + 0.62, -0.27 * Math.sin(a)], 'glassBlue', { segments: 4 }));
    }
    for (let k = 0; k < 8; k++) {
      const a = ((k + 0.5) / 8) * Math.PI * 2;
      parts.push(kit.cylinder(0.012, 0.012, 0.32, [0.42 * Math.cos(a), y0 + 0.19, -0.42 * Math.sin(a)], 'glassBlue', { segments: 4 }));
    }
    // benches at both ends, backs to the outside
    for (const dir of [1, -1]) {
      const z = dir * BENCH_Z;
      parts.push(
        kit.box([0.86, 0.04, 0.3], [0, 0.29, z], 'wood'),
        kit.box([0.86, 0.22, 0.04], [0, 0.5, z + dir * 0.13], 'wood', { rotate: [dir * -0.12, 0, 0] }),
        kit.box([0.06, 0.25, 0.28], [-0.37, 0.165, z], 'charcoal'),
        kit.box([0.06, 0.25, 0.28], [0.37, 0.165, z], 'charcoal'),
      );
    }
    // flower tubs
    TUBS.forEach(([x, z], i) => {
      parts.push(
        kit.cylinder(0.17, 0.13, 0.2, [x, PAVE + 0.1, z], 'terracotta', { segments: 8 }),
        kit.cylinder(0.15, 0.15, 0.02, [x, PAVE + 0.2, z], 'leaf', { segments: 8 }),
        kit.sphere(0.07, [x - 0.06, PAVE + 0.3, z], FLOWER_COLOURS[i % 4], { detail: 0 }),
        kit.sphere(0.07, [x + 0.06, PAVE + 0.3, z + 0.03], FLOWER_COLOURS[(i + 1) % 4], { detail: 0 }),
        kit.sphere(0.07, [x, PAVE + 0.32, z - 0.06], FLOWER_COLOURS[(i + 2) % 4], { detail: 0 }),
      );
    });
    return kit.finish(parts);
  },
};
