import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { rod, wheel } from '../../../models/parts';

// An old bicycle (heading +z) with a front basket full of flowers. Still.
const R = 0.18;
const T = 0.04;
const WZ = 0.28;

/** จักรยานติดตะกร้า: an old bicycle with a front basket of flowers. */
export const item: ItemModel = {
  id: 'bicycle',
  name: 'จักรยานติดตะกร้า',
  category: 'vehicle',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [];
    for (const z of [-WZ, WZ]) {
      parts.push(...wheel(kit, { at: [0, R + T, z], radius: R, tube: T, axis: 'x', color: 'charcoal', hubColor: 'stone', hubRadius: 0.035, hubLength: 0.08, tubularSegments: 12 }));
    }
    const hub = R + T;
    const bb: [number, number, number] = [0, 0.2, 0];
    const seatTop: [number, number, number] = [0, 0.5, -0.12];
    const headTop: [number, number, number] = [0, 0.56, 0.22];
    parts.push(
      rod(kit, bb, seatTop, 0.022, 'red', { segments: 6 }),
      rod(kit, bb, headTop, 0.022, 'red', { segments: 6 }),
      rod(kit, seatTop, headTop, 0.022, 'red', { segments: 6 }),
      rod(kit, seatTop, [0, hub, -WZ], 0.018, 'red', { segments: 6 }),
      rod(kit, bb, [0, hub, -WZ], 0.018, 'red', { segments: 6 }),
      rod(kit, headTop, [0, hub, WZ], 0.02, 'chrome', { segments: 6 }),
      kit.box([0.1, 0.035, 0.2], [0, 0.53, -0.14], 'charcoal'),
      kit.box([0.34, 0.03, 0.03], [0, 0.6, 0.22], 'charcoal'),
      kit.cylinder(0.025, 0.025, 0.1, [0.19, 0.2, 0], 'stoneDark', { segments: 6, rotate: [0, 0, Math.PI / 2] }),
    );
    // front basket (wicker) with flowers
    parts.push(kit.cylinder(0.14, 0.11, 0.14, [0, 0.68, 0.32], 'sand', { segments: 8 }));
    const flowers = ['pink', 'sunYellow', 'red', 'purple', 'pink', 'sunYellow', 'orange'] as const;
    flowers.forEach((c, i) => {
      const a = (i / 6) * Math.PI * 2;
      const rr = i === 6 ? 0 : 0.07;
      parts.push(kit.sphere(0.05, [rr * Math.cos(a), 0.79 + (i % 2) * 0.02, 0.32 + rr * Math.sin(a)], c, { detail: 0 }));
    });
    parts.push(kit.sphere(0.06, [0, 0.76, 0.32], 'leaf', { detail: 0, scale: [2, 0.5, 1.6] }));
    return kit.finish(parts);
  },
};
