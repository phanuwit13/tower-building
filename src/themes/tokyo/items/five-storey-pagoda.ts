import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import { door, glassWindow } from '../../../models/parts';

// 2x2. A five-storey pagoda: red posts, dark curved roofs, a stone base and a gold spire.
const BASE_TOP = 0.14;
const STOREY = 0.36; // wall height
const ROOF_RISE = 0.2;
const TIER = STOREY + ROOF_RISE;
/** Half-width of each roof, bottom to top. */
const ROOF_R = [0.94, 0.8, 0.68, 0.56, 0.44];

/** เจดีย์ห้าชั้น: five stacked storeys. */
export const item: ItemModel = {
  id: 'five-storey-pagoda',
  name: 'เจดีย์ห้าชั้น',
  category: 'building',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([1.98, 0.03, 1.98], [0, 0.015, 0], 'stone'),
      kit.box([1.7, 0.08, 1.7], [0, 0.07, 0], 'stoneDark'),
      kit.box([1.5, 0.06, 1.5], [0, 0.11, 0], 'stone'),
      kit.box([0.14, 0.06, 0.3], [0.91, 0.04, 0], 'stone'), // front step
    ];
    ROOF_R.forEach((R, i) => {
      const W = R - 0.2; // wall half-width
      const y0 = BASE_TOP + i * TIER;
      parts.push(kit.box([2 * W, STOREY, 2 * W], [0, y0 + STOREY / 2, 0], 'cream'));
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) parts.push(kit.cylinder(0.04, 0.04, STOREY, [sx * W, y0 + STOREY / 2, sz * W], 'red', { segments: 8 }));
      }
      // dark pyramid roof with upturned corners
      const top = y0 + STOREY;
      parts.push(
        kit.box([2 * R - 0.02, 0.05, 2 * R - 0.02], [0, top + 0.025, 0], 'terracotta'),
        kit.cone(R * Math.SQRT2, ROOF_RISE, [0, top + ROOF_RISE / 2 + 0.04, 0], (i % 2 === 0 ? 'charcoal' : 'stoneDark'), { segments: 4, rotate: [0, Math.PI / 4, 0] }),
      );
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) parts.push(kit.cone(0.045, 0.12, [sx * (R - 0.04), top + 0.1, sz * (R - 0.04)], 'stoneDark', { segments: 4 }));
      }
      if (i === 0) {
        // two paper lanterns hanging under the eave
        for (const z of [-0.3, 0.3]) {
          parts.push(
            kit.cylinder(0.014, 0.014, 0.12, [W + 0.1, y0 + 0.36, z], 'stoneDark', { segments: 4 }),
            kit.sphere(0.06, [W + 0.1, y0 + 0.24, z], 'lampWarm', { detail: 0, glow: true, light: 'breathe' }),
          );
        }
      }
      // lit windows on the two front sides; a door on the ground storey
      if (i === 0) parts.push(...door(kit, { at: [W, y0 + 0.14, 0], facing: 'x+', w: 0.22, h: 0.28, color: 'redDark' }));
      else parts.push(...glassWindow(kit, { at: [W, y0 + STOREY / 2, 0], facing: 'x+', w: 0.16, h: 0.18, frame: 'redDark', panes: 1 }));
      parts.push(...glassWindow(kit, { at: [0, y0 + STOREY / 2, W], facing: 'z+', w: 0.16, h: 0.18, frame: 'redDark', panes: 1 }));
    });
    // spire: pole and golden rings
    const spire = BASE_TOP + 5 * TIER + 0.04;
    parts.push(kit.cylinder(0.04, 0.05, 0.4, [0, spire + 0.2, 0], 'brass', { segments: 8 }));
    [0.08, 0.16, 0.24, 0.32].forEach((dy, k) => parts.push(kit.cylinder(0.1 - k * 0.015, 0.1 - k * 0.015, 0.035, [0, spire + dy, 0], 'sunYellow', { segments: 8 })));
    parts.push(kit.sphere(0.05, [0, spire + 0.44, 0], 'sunYellow', { detail: 0 }));
    return kit.finish(parts);
  },
};
