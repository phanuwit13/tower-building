import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

// A leaning A-frame ladder shelf (front faces +x) with four shelves of little pots and ivy
// hanging from the top bar.
const H = 1.5;
const FRONT = { bottom: 0.4, top: 0.04 }; // x of the front rails at the floor and at the top
const BACK = { bottom: -0.4, top: 0.0 };
const RAIL_Z = 0.7;
const SHELF_Y = [0.3, 0.62, 0.94, 1.26];
const POTS: PaletteColor[] = ['terracotta', 'pink', 'teal', 'sunYellow', 'skyBlue', 'white', 'red', 'purple'];
const LEAVES: PaletteColor[] = ['leaf', 'lime', 'leafDark', 'mint'];

/** x of a rail line at height y. */
const railX = (r: { bottom: number; top: number }, y: number): number => r.bottom + ((r.top - r.bottom) * y) / H;

/** ชั้นบันไดต้นไม้: a ladder shelf with small pots and hanging vines. */
export const item: ItemModel = {
  id: 'plant-ladder',
  name: 'ชั้นบันไดต้นไม้',
  category: 'nature',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    const rail = (r: { bottom: number; top: number }, z: number) => {
      const dx = r.top - r.bottom;
      const len = Math.hypot(H, dx);
      const a = Math.atan2(-dx, H);
      const lift = 0.025 * Math.abs(Math.sin(a)); // the rail's foot is a slanted end: lift it so its lowest corner sits on y = 0
      parts.push(kit.box([0.05, len, 0.06], [(r.bottom + r.top) / 2, H / 2 + lift, z], 'wood', { rotate: [0, 0, a] }));
    };
    for (const z of [-RAIL_Z, RAIL_Z]) {
      rail(FRONT, z);
      rail(BACK, z);
    }
    parts.push(kit.box([0.1, 0.05, 2 * RAIL_Z + 0.1], [0.02, H + 0.0, 0], 'woodDark')); // top bar
    let p = 0;
    SHELF_Y.forEach((y, row) => {
      const x0 = railX(BACK, y);
      const x1 = railX(FRONT, y) + 0.06;
      const cx = (x0 + x1) / 2;
      parts.push(kit.box([x1 - x0, 0.04, 2 * RAIL_Z + 0.04], [cx, y, 0], 'woodDark'));
      // three or four pots per shelf, a bit different each time
      const n = row % 2 === 0 ? 4 : 3;
      for (let i = 0; i < n; i++) {
        const z = ((i + 0.5) / n - 0.5) * 1.3;
        const r = 0.065 + ((i + row) % 3) * 0.012;
        const px = cx + ((i + row) % 2 === 0 ? 0.05 : -0.04);
        const c = POTS[p++ % POTS.length];
        parts.push(kit.cylinder(r, r * 0.8, 0.1, [px, y + 0.02 + 0.05, z], c, { segments: 8 }));
        parts.push(kit.sphere(r * 1.25, [px, y + 0.02 + 0.1 + r * 0.7, z], LEAVES[(i + row) % 4], { detail: 0 }));
        if ((i + row) % 3 === 1) parts.push(kit.sphere(0.035, [px + 0.02, y + 0.02 + 0.1 + r * 1.8, z], row % 2 ? 'pink' : 'sunYellow', { detail: 0 }));
      }
    });
    // ivy hanging from the top bar: a few strands of leaf balls, longer and shorter
    const strands: [number, number][] = [[-0.55, 4], [-0.2, 6], [0.15, 3], [0.5, 5]];
    for (const [z, n] of strands) {
      for (let i = 0; i < n; i++) {
        parts.push(kit.sphere(0.055 - i * 0.002, [0.1, H - 0.06 - i * 0.1, z], LEAVES[(i + (z > 0 ? 1 : 0)) % 4], { detail: 0 }));
      }
    }
    return kit.finish(parts);
  },
};
