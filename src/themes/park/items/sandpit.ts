import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';
import { rod } from '../../../models/parts';

const PIT = 1.9; // outer size
const BOARD = { w: 0.14, h: 0.17 };
const SAND_Y = 0.1;
const BUCKETS: Array<{ x: number; z: number; color: PaletteColor }> = [
  { x: 0.5, z: 0.45, color: 'red' },
  { x: 0.2, z: 0.6, color: 'blue' },
];
const SPADES: Array<{ x: number; z: number; yaw: number; color: PaletteColor }> = [
  { x: 0.55, z: -0.2, yaw: 0.5, color: 'sunYellow' },
  { x: -0.45, z: 0.5, yaw: -0.7, color: 'orange' },
];

/** บ่อทราย: a wooden sandpit with a sand castle, bright buckets and spades. */
export const item: ItemModel = {
  id: 'sandpit',
  name: 'บ่อทราย',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const edge = (PIT - BOARD.w) / 2;
    const parts: Part[] = [kit.box([PIT - 2 * BOARD.w + 0.02, SAND_Y, PIT - 2 * BOARD.w + 0.02], [0, SAND_Y / 2, 0], 'sand')];
    for (const s of [-1, 1]) {
      parts.push(
        kit.box([BOARD.w, BOARD.h, PIT], [s * edge, BOARD.h / 2, 0], 'wood'),
        kit.box([PIT - 2 * BOARD.w, BOARD.h, BOARD.w], [0, BOARD.h / 2, s * edge], 'woodDark'),
      );
      for (const sz of [-1, 1]) parts.push(kit.box([0.18, 0.06, 0.18], [s * edge, BOARD.h + 0.03, sz * edge], 'sunYellow'));
    }
    // sand castle: keep, four towers, a tall middle tower with a red flag
    const cx = -0.3;
    const cz = -0.3;
    parts.push(kit.box([0.5, 0.16, 0.5], [cx, SAND_Y + 0.08, cz], 'sand'));
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        parts.push(kit.cylinder(0.075, 0.09, 0.3, [cx + sx * 0.25, SAND_Y + 0.15, cz + sz * 0.25], 'sand', { segments: 8 }));
        parts.push(kit.cone(0.09, 0.1, [cx + sx * 0.25, SAND_Y + 0.35, cz + sz * 0.25], 'orange', { segments: 8 }));
      }
    }
    const midTop = SAND_Y + 0.16 + 0.2;
    parts.push(
      kit.cylinder(0.1, 0.12, 0.2, [cx, SAND_Y + 0.16 + 0.1, cz], 'sand', { segments: 8 }),
      kit.cylinder(0.012, 0.012, 0.18, [cx, midTop + 0.09, cz], 'woodDark', { segments: 4 }),
      kit.box([0.12, 0.07, 0.02], [cx + 0.07, midTop + 0.15, cz], 'red'),
    );
    for (const { x, z, color } of BUCKETS) {
      const rim = SAND_Y + 0.17;
      parts.push(
        kit.cylinder(0.1, 0.075, 0.17, [x, SAND_Y + 0.085, z], color, { segments: 10 }),
        kit.sphere(0.09, [x, rim, z], 'sand', { scale: [1, 0.4, 1], detail: 0 }),
        kit.torus(0.1, 0.015, [x, rim, z], 'white', { arc: Math.PI, tubularSegments: 6, radialSegments: 4, rotate: [0, 0.7, 0] }),
      );
    }
    for (const { x, z, yaw, color } of SPADES) {
      const dx = Math.cos(yaw);
      const dz = -Math.sin(yaw);
      const y = SAND_Y + 0.02;
      parts.push(
        rod(kit, [x, y, z], [x + dx * 0.3, y, z + dz * 0.3], 0.02, 'woodDark', { segments: 4 }),
        kit.box([0.14, 0.03, 0.12], [x - dx * 0.05, y, z - dz * 0.05], color, { rotate: [0, yaw, 0] }),
      );
    }
    return kit.finish(parts);
  },
};
