import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';

const TOP_Y = 0.5; // dining table top
const TX = 0.15; // table centre x
const BOARD_Y = TOP_Y + 0.0125;

/** โต๊ะบอร์ดเกม: a table with a checkered game board, dice and pawns, two stools, and a cube shelf of game boxes beside it. */
export const item: ItemModel = {
  id: 'board-game-table',
  name: 'โต๊ะบอร์ดเกม',
  category: 'play',
  footprint: { w: 2, d: 2 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([0.96, 0.05, 0.96], [TX, TOP_Y - 0.025, 0], 'wood'),
      kit.box([0.74, 0.025, 0.74], [TX, BOARD_Y, 0], 'woodDark'),
    ];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push(kit.box([0.07, 0.45, 0.07], [TX + sx * 0.4, 0.225, sz * 0.4], 'woodDark'));
    // 4 x 4 checkers: the light squares (the dark ones are the board itself)
    const cell = 0.15;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      if ((i + j) % 2 === 0) parts.push(kit.box([cell, 0.012, cell], [TX + (i - 1.5) * cell, BOARD_Y + 0.0185, (j - 1.5) * cell], 'cream'));
    }
    const top = BOARD_Y + 0.025;
    parts.push(
      // two pawns (plain cones and balls) and two dice with one pip each
      kit.cone(0.04, 0.09, [TX - 0.15, top + 0.045, -0.15], 'red', { segments: 8 }),
      kit.cone(0.04, 0.09, [TX + 0.15, top + 0.045, 0.15], 'blue', { segments: 8 }),
      kit.box([0.07, 0.07, 0.07], [TX + 0.0, top + 0.035, 0.0], 'white', { rotate: [0, 0.5, 0] }),
      kit.box([0.07, 0.07, 0.07], [TX + 0.12, top + 0.035, -0.12], 'white', { rotate: [0, 0.2, 0] }),
      kit.box([0.025, 0.012, 0.025], [TX, top + 0.075, 0], 'red', { rotate: [0, 0.5, 0] }),
      kit.box([0.025, 0.012, 0.025], [TX + 0.12, top + 0.075, -0.12], 'blue', { rotate: [0, 0.2, 0] }),
    );
    // two stools (seat 0.31)
    for (const sz of [-1, 1]) {
      const z = sz * 0.7;
      parts.push(
        kit.cylinder(0.17, 0.17, 0.05, [TX, 0.285, z], sz > 0 ? 'orange' : 'leaf', { segments: 10 }),
        kit.cylinder(0.03, 0.03, 0.26, [TX, 0.13, z], 'woodDark', { segments: 6 }),
        kit.cylinder(0.14, 0.14, 0.03, [TX, 0.015, z], 'woodDark', { segments: 8 }),
      );
    }
    // cube shelf against the back (top 0.62): two rows of cubbies holding game boxes
    const SX = -0.78;
    parts.push(
      kit.box([0.34, 0.04, 1.8], [SX, 0.02, 0], 'woodDark'),
      kit.box([0.34, 0.04, 1.8], [SX, 0.31, 0], 'wood'),
      kit.box([0.34, 0.04, 1.8], [SX, 0.6, 0], 'wood'),
      kit.box([0.03, 0.58, 1.8], [SX - 0.155, 0.31, 0], 'woodDark'),
    );
    for (const z of [-0.88, -0.3, 0.3, 0.88]) parts.push(kit.box([0.34, 0.58, 0.04], [SX, 0.31, z], 'woodDark'));
    const boxCols = ['red', 'blue', 'sunYellow', 'leaf', 'purple', 'orange'] as const;
    [-0.6, 0, 0.6].forEach((z, i) => {
      parts.push(
        kit.box([0.26, 0.05, 0.4], [SX + 0.02, 0.065, z], boxCols[i]),
        kit.box([0.26, 0.05, 0.4], [SX + 0.02, 0.115, z], boxCols[i + 3]),
        kit.box([0.24, 0.3, 0.06], [SX + 0.02, 0.19, z + 0.12], boxCols[(i + 1) % 6]), // a box stood on its edge
        kit.box([0.26, 0.05, 0.4], [SX + 0.02, 0.355, z], boxCols[(i + 4) % 6]),
        kit.box([0.26, 0.05, 0.4], [SX + 0.02, 0.405, z], boxCols[(i + 2) % 6]),
      );
    });
    return kit.finish(parts);
  },
};
