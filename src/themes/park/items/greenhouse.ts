import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { door } from '../../../models/parts';

// Long side along z, door on the +x wall. Glass walls (warm window glow at night), a glass gable roof with
// open skylight gaps so the plants inside read from above, a white ridge, and flowering plants in the gaps.
const PLINTH = { w: 1.9, d: 2.9, h: 0.08 };
const WALL = { x: 0.85, z: 1.35, top: 0.95 }; // wall centre lines and the height of the eaves
const PANE = { y: 0.28, h: 0.67, t: 0.04 }; // glass above the white sill
const RISE = 0.55;
const RUN = 0.92; // flat reach of one roof slope, eave included
const ANGLE = Math.atan2(RISE, RUN);
const SLOPE_LEN = Math.hypot(RISE, RUN);
const ROOF_PANELS: Array<[number, number]> = [[-1.42, -0.75], [-0.3, 0.3], [0.75, 1.42]]; // z ranges; the gaps between stay open
const GLASS_GLOW = { glow: 'windowWarm', light: 'window' } as const; // only a small lit pane per glass pane: a whole glowing wall would bloom white

/** One flowering plant seen through a skylight gap. */
function plant(kit: Parameters<ItemModel['build']>[0], x: number, z: number, h: number, flower: PaletteColor): Part[] {
  const y0 = PLINTH.h + 0.03;
  return [
    kit.cylinder(0.03, 0.04, h, [x, y0 + h / 2, z], 'woodDark', { segments: 6 }),
    kit.sphere(0.2, [x, y0 + h, z], 'leaf'),
    kit.sphere(0.14, [x + 0.12, y0 + h - 0.12, z + 0.06], 'leafDark', { detail: 0 }),
    kit.sphere(0.14, [x - 0.1, y0 + h - 0.1, z - 0.08], 'lime', { detail: 0 }),
    kit.sphere(0.06, [x + 0.05, y0 + h + 0.17, z + 0.04], flower, { detail: 0 }),
    kit.sphere(0.06, [x - 0.08, y0 + h + 0.1, z - 0.05], flower, { detail: 0 }),
  ];
}

/** เรือนกระจกพรรณไม้: a glass greenhouse full of plants, lit warm at night. */
export const item: ItemModel = {
  id: 'greenhouse',
  name: 'เรือนกระจกพรรณไม้',
  category: 'building',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([PLINTH.w, PLINTH.h, PLINTH.d], [0, PLINTH.h / 2, 0], 'stone'),
      kit.box([1.6, 0.03, 2.6], [0, PLINTH.h + 0.015, 0], 'bark'), // soil
    ];
    // white sills and corner / mid posts
    for (const sx of [-1, 1]) parts.push(kit.box([0.1, 0.2, 2.8], [sx * WALL.x, PLINTH.h + 0.1, 0], 'white'));
    for (const sz of [-1, 1]) parts.push(kit.box([1.8, 0.2, 0.1], [0, PLINTH.h + 0.1, sz * WALL.z], 'white'));
    const postY = PLINTH.h + (WALL.top - PLINTH.h) / 2;
    const postH = WALL.top - PLINTH.h;
    for (const sx of [-1, 1]) {
      for (const z of [-WALL.z, -0.45, 0.45, WALL.z]) parts.push(kit.box([0.09, postH, 0.08], [sx * WALL.x, postY, z], 'white'));
    }
    for (const sz of [-1, 1]) parts.push(kit.box([0.08, postH, 0.08], [0, postY, sz * WALL.z], 'white'));
    // glass panes: long walls in three, end walls in two
    const paneY = PANE.y + PANE.h / 2;
    for (const sx of [-1, 1]) {
      for (const z of [-0.9, 0, 0.9]) {
        if (sx === 1 && z === 0.9) continue; // the door
        parts.push(
          kit.box([PANE.t, PANE.h, 0.82], [sx * WALL.x, paneY, z], 'glassBlue'),
          kit.box([PANE.t + 0.02, 0.36, 0.5], [sx * WALL.x, paneY, z], 'skyBlue', GLASS_GLOW),
        );
      }
    }
    for (const sz of [-1, 1]) {
      for (const x of [-0.42, 0.42]) {
        parts.push(
          kit.box([0.78, PANE.h, PANE.t], [x, paneY, sz * WALL.z], 'glassBlue'),
          kit.box([0.5, 0.36, PANE.t + 0.02], [x, paneY, sz * WALL.z], 'skyBlue', GLASS_GLOW),
        );
      }
    }
    parts.push(...door(kit, { at: [WALL.x + 0.02, PLINTH.h + 0.3, 0.9], facing: 'x+', w: 0.5, h: 0.6, color: 'teal', knob: 'sunYellow' }));
    // gable ends and the roof
    for (const sz of [-1, 1]) parts.push(kit.wedge([1.74, RISE, 0.04], [0, WALL.top + RISE / 2, sz * WALL.z], 'glassBlue'));
    for (const sx of [-1, 1]) {
      for (const [z0, z1] of ROOF_PANELS) {
        parts.push(kit.box([SLOPE_LEN, 0.04, z1 - z0], [sx * RUN / 2, WALL.top + RISE / 2 + 0.02, (z0 + z1) / 2], 'skyBlue', { rotate: [0, 0, -sx * ANGLE] }));
      }
      for (const z of [-0.75, -0.3, 0.3, 0.75]) {
        parts.push(kit.box([SLOPE_LEN, 0.05, 0.05], [sx * RUN / 2, WALL.top + RISE / 2 + 0.03, z], 'white', { rotate: [0, 0, -sx * ANGLE] }));
      }
    }
    parts.push(kit.box([0.08, 0.07, 2.84], [0, WALL.top + RISE + 0.01, 0], 'white'));
    // plants seen through the skylight gaps
    const FLOWERS: PaletteColor[] = ['pink', 'sunYellow', 'orange', 'purple', 'red', 'pink'];
    let i = 0;
    for (const z of [-0.52, 0.52]) {
      for (const x of [-0.55, 0, 0.55]) {
        parts.push(...plant(kit, x, z, x === 0 ? 0.55 : 0.36, FLOWERS[i % FLOWERS.length]));
        i++;
      }
    }
    return kit.finish(parts);
  },
};
