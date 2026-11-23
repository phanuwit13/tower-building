import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// Low kids' table (top 0.40), four small chairs, crayons and drawings.
const TOP_Y = 0.4;
const SEAT_Y = 0.28;
const T = 0.4; // table half size
const CRAYON = ['red', 'sunYellow', 'blue', 'leaf', 'orange', 'purple'] as const;

/** โต๊ะระบายสีเด็ก: a low table with four small chairs, crayons and drawings. */
export const item: ItemModel = {
  id: 'kids-drawing-table',
  name: 'โต๊ะระบายสีเด็ก',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [kit.box([2 * T, 0.05, 2 * T], [0, TOP_Y - 0.025, 0], 'sunYellow')];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      parts.push(kit.box([0.07, TOP_Y - 0.05, 0.07], [sx * (T - 0.07), (TOP_Y - 0.05) / 2, sz * (T - 0.07)], 'woodDark'));
    }
    // drawings: thin coloured sheets with simple shape blobs (no writing)
    parts.push(
      kit.box([0.3, 0.008, 0.22], [0.1, TOP_Y + 0.004, 0.1], 'white', { rotate: [0, 0.2, 0] }),
      kit.sphere(0.06, [0.12, TOP_Y + 0.03, 0.1], 'sunYellow', { detail: 0, scale: [1, 0.15, 1] }),
      kit.box([0.1, 0.012, 0.06], [0.06, TOP_Y + 0.015, 0.14], 'leaf', { rotate: [0, 0.2, 0] }),
      kit.box([0.26, 0.008, 0.2], [-0.15, TOP_Y + 0.004, -0.15], 'glassBlue', { rotate: [0, -0.3, 0] }),
      kit.sphere(0.05, [-0.15, TOP_Y + 0.025, -0.15], 'red', { detail: 0, scale: [1, 0.15, 1] }),
    );
    // crayons: a cup of them and a few lying flat
    parts.push(kit.cylinder(0.06, 0.05, 0.1, [-0.22, TOP_Y + 0.05, 0.2], 'teal', { segments: 8 }));
    CRAYON.forEach((c, i) => {
      parts.push(kit.cylinder(0.014, 0.014, 0.13, [-0.22 + (i - 2.5) * 0.015, TOP_Y + 0.14, 0.2 + ((i % 2) - 0.5) * 0.03], c, { segments: 4, rotate: [(i - 2.5) * 0.08, 0, (i - 2.5) * 0.1] }));
    });
    for (let i = 0; i < 4; i++) {
      parts.push(kit.cylinder(0.014, 0.014, 0.12, [0.25, TOP_Y + 0.014, -0.12 + i * 0.05], CRAYON[i], { segments: 4, rotate: [0, 0.15 * i, Math.PI / 2] }));
    }
    // four small chairs, one on each side, backs outwards
    const chairs: Array<[number, number, number, 'orange' | 'pink' | 'blue' | 'lime']> = [[0.68, 0, 0, 'orange'], [-0.68, 0, Math.PI, 'pink'], [0, 0.68, -Math.PI / 2, 'blue'], [0, -0.68, Math.PI / 2, 'lime']];
    for (const [cx, cz, yaw, color] of chairs) {
      const p = (lx: number, ly: number, lz: number, size: [number, number, number], c: typeof color | 'woodDark') => {
        // local x points away from the table; rotate the offset about y
        const x = cx + lx * Math.cos(yaw) + lz * Math.sin(yaw);
        const z = cz - lx * Math.sin(yaw) + lz * Math.cos(yaw);
        return kit.box(size, [x, ly, z], c, { rotate: [0, yaw, 0] });
      };
      parts.push(p(0, SEAT_Y, 0, [0.26, 0.04, 0.26], color));
      parts.push(p(0.11, SEAT_Y + 0.02 + 0.1, 0, [0.04, 0.2, 0.26], color));
      for (const lx of [-0.1, 0.1]) for (const lz of [-0.1, 0.1]) parts.push(p(lx, SEAT_Y / 2 - 0.01, lz, [0.04, SEAT_Y - 0.02, 0.04], 'woodDark'));
    }
    return kit.finish(parts);
  },
};
