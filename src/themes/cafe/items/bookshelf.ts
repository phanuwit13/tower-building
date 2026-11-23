import type { ItemModel } from '../../../models/contract';
import type { Part, StyleKit } from '../../../models/kit';

const BOOK_COLORS = ['red', 'blue', 'sunYellow', 'leaf', 'purple', 'orange', 'pink', 'teal', 'mint', 'terracotta'] as const;
const WIDTHS = [0.05, 0.07, 0.06, 0.04, 0.08] as const;
const HEIGHTS = [0.22, 0.28, 0.2, 0.26, 0.24] as const;
const LEVELS = [0.06, 0.4, 0.74, 1.08]; // top of each board
const TOP = 1.4;
const CX = -0.1; // shelf centre x; it is 0.4 deep and 1.8 long (z)

/** A row of thin coloured books (no titles), spines facing +x. */
function bookRow(kit: StyleKit, y: number, z0: number, z1: number, shift: number): Part[] {
  const out: Part[] = [];
  let z = z0;
  for (let i = 0; ; i++) {
    const w = WIDTHS[(i + shift) % WIDTHS.length];
    if (z + w > z1) break;
    const h = HEIGHTS[(i * 3 + shift) % HEIGHTS.length];
    out.push(kit.box([0.28, h, w], [CX + 0.01, y + h / 2, z + w / 2], BOOK_COLORS[(i * 7 + shift) % BOOK_COLORS.length]));
    z += w + 0.006;
  }
  return out;
}

/** ชั้นหนังสือ: a tall shelf of colourful books with a potted plant on top. */
export const item: ItemModel = {
  id: 'bookshelf',
  name: 'ชั้นหนังสือ',
  category: 'decoration',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const s of [-1, 1]) parts.push(kit.box([0.4, TOP, 0.07], [CX, TOP / 2, s * 0.865], 'woodDark'));
    for (const y of [...LEVELS, TOP]) parts.push(kit.box([0.4, 0.05, 1.8], [CX, y - 0.025, 0], 'wood'));
    parts.push(kit.box([0.03, TOP, 1.8], [CX - 0.185, TOP / 2, 0], 'woodDark'));
    LEVELS.forEach((y, r) => parts.push(...bookRow(kit, y, -0.8, 0.8, r * 2 + 1)));
    // potted plant on top
    parts.push(
      kit.cylinder(0.12, 0.09, 0.16, [CX, TOP + 0.08, 0.35], 'terracotta', { segments: 8 }),
      kit.sphere(0.17, [CX, TOP + 0.27, 0.35], 'leaf', { detail: 1 }),
      kit.sphere(0.11, [CX + 0.05, TOP + 0.4, 0.3], 'leafDark', { detail: 0 }),
      // a small stack of books and a tiny globe-less toy on top
      kit.box([0.22, 0.05, 0.3], [CX, TOP + 0.025, -0.4], 'blue', { rotate: [0, 0.2, 0] }),
      kit.box([0.2, 0.05, 0.26], [CX, TOP + 0.075, -0.4], 'red', { rotate: [0, -0.15, 0] }),
      kit.box([0.18, 0.05, 0.22], [CX, TOP + 0.125, -0.4], 'sunYellow', { rotate: [0, 0.3, 0] }),
    );
    return kit.finish(parts);
  },
};
