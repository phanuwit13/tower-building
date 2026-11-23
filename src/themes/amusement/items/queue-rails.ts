import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod } from '../../../models/parts';

// Five short posts zig-zagging along z (1x2), two rails of red and white tape strung between them.
const POST = { r: 0.04, h: 0.5, base: 0.1 };
const XS = [-0.32, 0.32]; // posts alternate between the two sides
const Z0 = -0.8;
const GAP = 0.4;
const COUNT = 5;
const RAILS = [{ y: 0.42, color: 'red' }, { y: 0.26, color: 'white' }] as const;

/** แนวกั้นคิว: zigzag queue rails on short posts. */
export const item: ItemModel = {
  id: 'queue-rails',
  name: 'แนวกั้นคิว',
  category: 'facility',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts: Part[] = [];
    const at = (i: number) => [XS[i % 2], Z0 + i * GAP] as const;
    for (let i = 0; i < COUNT; i++) {
      const [x, z] = at(i);
      parts.push(
        kit.cylinder(POST.base, POST.base, 0.03, [x, 0.015, z], 'charcoal', { segments: 8 }),
        kit.cylinder(POST.r, POST.r, POST.h, [x, POST.h / 2, z], 'chrome', { segments: 8 }),
        kit.sphere(0.06, [x, POST.h + 0.03, z], 'sunYellow', { detail: 0 }),
      );
    }
    for (let i = 0; i + 1 < COUNT; i++) {
      const [x0, z0] = at(i);
      const [x1, z1] = at(i + 1);
      for (const r of RAILS) parts.push(rod(kit, [x0, r.y, z0], [x1, r.y, z1], 0.018, r.color, { segments: 6 }));
    }
    return kit.finish(parts);
  },
};
