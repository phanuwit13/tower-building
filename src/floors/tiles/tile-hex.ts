import type { Part } from '../../models/kit';
import type { FloorTile } from '../types';

const BASE_H = 0.008; // the grout
const HEX_H = 0.007; // top at 0.015, the most a tile may rise
const R = 0.2857; // honeycomb radius: three hexagons (two below, one above) fill the cell, 1 / 3.5
const DRAW_R = 0.265; // a little smaller, so grout shows between them
const DX = (Math.sqrt(3) / 2) * R;
const LOW_Z = -0.5 + R;
/** The honeycomb cluster: [x, z, colour]. */
const HEXES: Array<[number, number, 'terracotta' | 'sand' | 'cream']> = [
  [-DX, LOW_Z, 'terracotta'], [DX, LOW_Z, 'sand'], [0, LOW_Z + 1.5 * R, 'cream'],
];

/** กระเบื้องหกเหลี่ยม: three honeycomb hexagons in warm colours, with grout. */
export const tile: FloorTile = {
  id: 'tile-hex',
  name: 'กระเบื้องหกเหลี่ยม',
  group: 'tile',
  build: (kit) => {
    const parts: Part[] = [kit.box([1, BASE_H, 1], [0, BASE_H / 2, 0], 'stoneDark')];
    for (const [x, z, color] of HEXES) {
      parts.push(kit.cylinder(DRAW_R, DRAW_R, HEX_H, [x, BASE_H + HEX_H / 2, z], color, { segments: 6 }));
    }
    return kit.finish(parts);
  },
};
