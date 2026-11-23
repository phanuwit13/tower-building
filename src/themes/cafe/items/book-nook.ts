import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';
import { rod } from '../../../models/parts';

const BOOK_COLORS = ['red', 'blue', 'sunYellow', 'leaf', 'purple', 'orange', 'pink', 'teal', 'mint', 'terracotta'] as const;
const WIDTHS = [0.05, 0.07, 0.06, 0.04, 0.08] as const;
const HEIGHTS = [0.26, 0.3, 0.22, 0.28, 0.24] as const;
const SHELF_X = -0.78; // shelf centre x (it stands against the back, -x)
const LEVELS = [0.06, 0.4, 0.74, 1.08, 1.42]; // top of each board

/** A row of thin coloured books (no titles) standing on a board, spines facing +x. */
function bookRow(kit: StyleKit, x: number, y: number, z0: number, z1: number, depth: number, shift: number): Part[] {
  const out: Part[] = [];
  let z = z0;
  for (let i = 0; ; i++) {
    const w = WIDTHS[(i + shift) % WIDTHS.length];
    if (z + w > z1) break;
    const h = HEIGHTS[(i * 3 + shift) % HEIGHTS.length];
    out.push(kit.box([depth, h, w], [x, y + h / 2, z + w / 2], BOOK_COLORS[(i * 7 + shift) % BOOK_COLORS.length]));
    z += w + 0.006;
  }
  return out;
}

/** มุมหนังสือ: a tall bookshelf, a backless reading bench with cushions, a small ladder and a rug. */
export const item: ItemModel = {
  id: 'book-nook',
  name: 'มุมหนังสือ',
  category: 'decoration',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [];
    // shelf frame: two ends, boards, a back
    for (const s of [-1, 1]) parts.push(kit.box([0.34, 1.48, 0.06], [SHELF_X, 0.74, s * 1.37], 'woodDark'));
    for (const y of LEVELS) parts.push(kit.box([0.34, 0.05, 2.8], [SHELF_X, y - 0.025, 0], 'wood'));
    parts.push(kit.box([0.03, 1.48, 2.8], [SHELF_X - 0.155, 0.74, 0], 'woodDark'));
    // books on the lower four boards; the top board holds a few and a plant
    LEVELS.slice(0, 4).forEach((y, r) => {
      parts.push(...bookRow(kit, SHELF_X + 0.02, y, -1.32, 1.32, 0.27, r * 2));
    });
    parts.push(
      kit.cylinder(0.09, 0.07, 0.12, [SHELF_X, 1.48, 0.9], 'terracotta', { segments: 8 }),
      kit.sphere(0.13, [SHELF_X, 1.62, 0.9], 'leaf', { detail: 0 }),
      kit.sphere(0.09, [SHELF_X, 1.7, 0.84], 'leafDark', { detail: 0 }),
    );
    // reading bench (seat 0.31), backless, with cushions
    for (const z of [-0.5, 1.1]) {
      parts.push(
        kit.box([0.4, 0.26, 0.06], [0.0, 0.13, z], 'woodDark'),
      );
    }
    parts.push(
      kit.box([0.44, 0.06, 1.8], [0.0, 0.28, 0.3], 'wood'),
      kit.box([0.4, 0.07, 0.4], [0.0, 0.345, -0.1], 'pink'),
      kit.box([0.4, 0.07, 0.4], [0.0, 0.345, 0.45], 'sunYellow'),
      kit.box([0.4, 0.07, 0.3], [0.0, 0.345, 0.95], 'mint'),
      // rug in front of the bench
      kit.box([0.5, 0.03, 1.9], [0.55, 0.015, 0.2], 'terracotta'),
      kit.box([0.38, 0.035, 1.78], [0.55, 0.0175, 0.2], 'sand'),
      // two books stacked on the floor
      kit.box([0.2, 0.05, 0.16], [0.35, 0.065, -1.2], 'blue', { rotate: [0, 0.3, 0] }),
      kit.box([0.18, 0.05, 0.14], [0.35, 0.115, -1.2], 'red', { rotate: [0, -0.2, 0] }),
    );
    // small ladder leaning on the shelf at the -z end
    for (const z of [-1.05, -0.8]) {
      parts.push(rod(kit, [-0.38, 0.006, z], [-0.61, 1.3, z], 0.022, 'woodDark', { segments: 6 }));
    }
    for (const t of [0.15, 0.4, 0.65, 0.88]) {
      parts.push(kit.box([0.04, 0.035, 0.26], [-0.38 - 0.23 * t, 0.006 + 1.294 * t, -0.925], 'wood'));
    }
    return kit.finish(parts);
  },
};
