import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

// 1×2, running along z. A strip of stream between two low banks, with pebbles, rocks and reeds.
const BED = 0.03;
const WATER_TOP = 0.05;
const BANK = { h: 0.08, x: 0.33 }; // banks stand from |x| = 0.33 to the tile edge
/** Pebbles in the water: [x, z, size]. */
const PEBBLES: Array<[number, number, number]> = [[-0.1, 0.7, 0.05], [0.12, 0.3, 0.04], [-0.05, -0.2, 0.055], [0.1, -0.65, 0.045], [-0.15, -0.85, 0.035]];
/** Rocks on the banks: [x, z, size, dark?]. */
const ROCKS: Array<[number, number, number, boolean]> = [[0.37, 0.55, 0.1, false], [-0.38, -0.3, 0.09, true], [0.38, -0.75, 0.08, false], [-0.37, 0.8, 0.07, false]];
/** Reeds on the banks: [x, z, height]. */
const REEDS: Array<[number, number, number]> = [[0.4, 0.15, 0.42], [0.45, 0.25, 0.34], [-0.42, 0.45, 0.4], [-0.36, 0.55, 0.32], [0.44, -0.4, 0.36], [-0.44, -0.85, 0.38]];

/** The stream's parts, shared with stepping-stones so the two line up (z runs the length of the tile). */
export function streamStrip(kit: Parameters<ItemModel['build']>[0]): Part[] {
  const bankW = 0.5 - BANK.x;
  return [
    kit.box([0.98, BED, 1.98], [0, BED / 2, 0], 'sand'),
    kit.box([bankW, BANK.h, 1.98], [BANK.x + bankW / 2, BANK.h / 2, 0], 'lime'),
    kit.box([bankW, BANK.h, 1.98], [-BANK.x - bankW / 2, BANK.h / 2, 0], 'lime'),
    kit.box([0.04, BANK.h + 0.01, 1.98], [BANK.x + 0.02, (BANK.h + 0.01) / 2, 0], 'sand'), // muddy edges
    kit.box([0.04, BANK.h + 0.01, 1.98], [-BANK.x - 0.02, (BANK.h + 0.01) / 2, 0], 'sand'),
    kit.box([BANK.x * 2 - 0.04, WATER_TOP, 1.98], [0, WATER_TOP / 2, 0], 'navy', { motion: { kind: 'water', water: 'pond' } }),
  ];
}

/** ลำธาร: a strip of stream with pebbles, rocks and reeds. */
export const item: ItemModel = {
  id: 'stream',
  name: 'ลำธาร',
  category: 'nature',
  footprint: { w: 1, d: 2 },
  build: (kit) => {
    const parts = streamStrip(kit);
    for (const [x, z, r] of PEBBLES) parts.push(kit.sphere(r, [x, WATER_TOP + r * 0.4, z], 'stone', { detail: 0, scale: [1.3, 0.6, 1] }));
    for (const [x, z, r, dark] of ROCKS) parts.push(kit.sphere(r, [x, BANK.h + r * 0.45, z], dark ? 'stoneDark' : 'stone', { detail: 0, scale: [1.2, 0.75, 1] }));
    for (const [x, z, h] of REEDS) {
      parts.push(
        kit.cylinder(0.014, 0.022, h, [x, BANK.h + h / 2, z], 'leaf', { segments: 4 }),
        kit.cylinder(0.026, 0.026, 0.09, [x, BANK.h + h + 0.015, z], 'bark', { segments: 6 }),
      );
    }
    // a tuft of flowers and a lily pad
    parts.push(
      kit.sphere(0.05, [0.42, BANK.h + 0.05, -0.1], 'pink', { detail: 0 }),
      kit.sphere(0.045, [-0.43, BANK.h + 0.05, 0.1], 'sunYellow', { detail: 0 }),
      kit.cylinder(0.08, 0.08, 0.02, [0.05, WATER_TOP + 0.01, 0.9], 'leaf', { segments: 8 }),
    );
    return kit.finish(parts);
  },
};
