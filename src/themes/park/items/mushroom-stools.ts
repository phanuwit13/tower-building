import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { PaletteColor } from '../../../models/palette';

const G = 0.03;
const STOOL = { r: 0.15, stem: 0.07, stemH: 0.2, rim: 0.34, domeH: 0.07 }; // seat top at about 0.27
const TABLE = { r: 0.2, stem: 0.08, stemH: 0.3, domeH: 0.07 }; // table top at about 0.38
const STOOLS: Array<{ yaw: number; color: PaletteColor }> = [
  { yaw: 0.2, color: 'orange' },
  { yaw: 0.2 + (2 * Math.PI) / 3, color: 'pink' },
  { yaw: 0.2 + (4 * Math.PI) / 3, color: 'sunYellow' },
];

/** เก้าอี้เห็ด: three mushroom stools (orange, pink, yellow) round a little red mushroom table with white spots. */
export const item: ItemModel = {
  id: 'mushroom-stools',
  name: 'เก้าอี้เห็ด',
  category: 'seating',
  footprint: { w: 1, d: 1 },
  build: (kit) => {
    const parts: Part[] = [kit.cylinder(0.48, 0.48, G, [0, G / 2, 0], 'lime', { segments: 16 })];
    parts.push(
      kit.cylinder(TABLE.stem, TABLE.stem + 0.02, TABLE.stemH, [0, G + TABLE.stemH / 2, 0], 'cream', { segments: 8 }),
      kit.dome(TABLE.r, [0, G + TABLE.stemH - 0.02, 0], 'red', { segments: 12, scale: [1, TABLE.domeH / TABLE.r, 1] }),
    );
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + 0.5;
      parts.push(kit.sphere(0.022, [0.12 * Math.cos(a), G + TABLE.stemH + 0.045, 0.12 * Math.sin(a)], 'white', { detail: 0, scale: [1, 0.5, 1] }));
    }
    for (const { yaw, color } of STOOLS) {
      const x = STOOL.rim * Math.cos(yaw);
      const z = -STOOL.rim * Math.sin(yaw);
      parts.push(
        kit.cylinder(STOOL.stem, STOOL.stem + 0.015, STOOL.stemH, [x, G + STOOL.stemH / 2, z], 'cream', { segments: 8 }),
        kit.dome(STOOL.r, [x, G + STOOL.stemH - 0.02, z], color, { segments: 12, scale: [1, STOOL.domeH / STOOL.r, 1] }),
      );
      for (let i = 0; i < 3; i++) {
        const a = (i * 2 * Math.PI) / 3 + yaw;
        parts.push(kit.sphere(0.018, [x + 0.07 * Math.cos(a), G + STOOL.stemH + 0.03, z + 0.07 * Math.sin(a)], 'white', { detail: 0, scale: [1, 0.5, 1] }));
      }
    }
    return kit.finish(parts);
  },
};
