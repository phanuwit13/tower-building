import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const SAND = { r: 0.98, h: 0.03 };
const BASE = { r: 0.6, top: 0.5 }; // the round cabin under the counter
const COUNTER = { r: 0.74, h: 0.05 };
const COUNTER_TOP = BASE.top + COUNTER.h;
const POSTS = { r: 0.6, n: 6, h: 0.65 };
const ROOF_Y = COUNTER_TOP + POSTS.h; // thatched roof sits on the posts
const STOOLS = { n: 8, r: 0.86, seatY: 0.3 };

/** บาร์น้ำมะพร้าว: a round thatched kiosk selling fresh coconuts and juice, with stools around the counter. */
export const item: ItemModel = {
  id: 'coconut-bar',
  name: 'บาร์น้ำมะพร้าว',
  category: 'food',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.cylinder(SAND.r, SAND.r, SAND.h, [0, SAND.h / 2, 0], 'sand', { segments: 16 }),
      kit.cylinder(BASE.r, BASE.r, BASE.top - SAND.h, [0, (BASE.top + SAND.h) / 2, 0], 'teal', { segments: 12 }),
      kit.cylinder(COUNTER.r, COUNTER.r, COUNTER.h, [0, BASE.top + COUNTER.h / 2, 0], 'white', { segments: 12 }),
      kit.cylinder(0.76, 0.76, 0.02, [0, BASE.top + 0.01, 0], 'sunYellow', { segments: 12 }), // yellow trim under the counter
    ];
    for (let i = 0; i < POSTS.n; i++) {
      const a = (i / POSTS.n) * Math.PI * 2;
      parts.push(kit.cylinder(0.035, 0.035, POSTS.h, [Math.cos(a) * POSTS.r, COUNTER_TOP + POSTS.h / 2, -Math.sin(a) * POSTS.r], 'woodDark', { segments: 6 }));
    }
    // thatched roof: a wide cone, a smaller tier on top and a coconut finial
    parts.push(
      kit.cylinder(0.78, 0.94, 0.1, [0, ROOF_Y + 0.05, 0], 'sand', { segments: 12 }),
      kit.cone(0.94, 0.5, [0, ROOF_Y + 0.1 + 0.25, 0], 'brass', { segments: 12 }),
      kit.cone(0.55, 0.35, [0, ROOF_Y + 0.5, 0], 'sand', { segments: 12, rotate: [0, Math.PI / 12, 0] }),
      kit.sphere(0.07, [0, ROOF_Y + 0.88, 0], 'lime', { detail: 0 }),
    );
    // fresh coconuts on the counter (front, +x) and two with straws: the juice
    const cy = COUNTER_TOP + 0.07;
    [-0.36, -0.12, 0.12, 0.36].forEach((z, i) => {
      const x = Math.sqrt(0.66 * 0.66 - z * z);
      parts.push(kit.sphere(0.075, [x, cy, z], i % 2 ? 'lime' : 'mint', { detail: 0 }));
      if (i === 1 || i === 3) parts.push(kit.cylinder(0.014, 0.014, 0.16, [x, cy + 0.12, z], 'red', { segments: 4, rotate: [0, 0, 0.3] }));
    });
    parts.push(kit.sphere(0.075, [0.55, cy + 0.13, 0], 'lime', { detail: 0 }));
    // stools: a post and a round seat, all the way round
    for (let i = 0; i < STOOLS.n; i++) {
      const a = (i / STOOLS.n) * Math.PI * 2 + Math.PI / 8;
      const x = Math.cos(a) * STOOLS.r;
      const z = -Math.sin(a) * STOOLS.r;
      parts.push(
        kit.cylinder(0.025, 0.03, STOOLS.seatY - SAND.h, [x, (STOOLS.seatY + SAND.h) / 2, z], 'woodDark', { segments: 6 }),
        kit.cylinder(0.1, 0.1, 0.06, [x, STOOLS.seatY + 0.03, z], i % 2 ? 'orange' : 'sunYellow', { segments: 8 }),
      );
    }
    return kit.finish(parts);
  },
};
