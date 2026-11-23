import type { ItemModel } from '../../../models/contract';
import type { Part } from '../../../models/kit';
import type { MotionOpts } from '../../../models/motion';
import type { PaletteColor } from '../../../models/palette';

// A flooded paddy: three plots of navy water split by raised mud banks, rows of green rice clumps standing in the water.
const HALF_X = 1; // footprint half-width (x) and half-length (z)
const HALF_Z = 1.5;
const BANK = { w: 0.1, h: 0.09 }; // mud bank thickness and height
const WATER_H = 0.05;
const DIVIDERS = [-0.5, 0.5]; // z of the two cross banks
const ROWS_Z = [-1.15, -0.8, -0.2, 0.2, 0.8, 1.15]; // two rows of clumps in each plot
const COLS_X = [-0.66, -0.33, 0, 0.33, 0.66];
const CLUMP = { r: 0.06, h: 0.34, r2: 0.045, h2: 0.26 };

const WATER: MotionOpts = { kind: 'water', water: 'pond' };
const SWAY: MotionOpts = { kind: 'sway', pivot: [0, WATER_H, 0], amount: 0.15 }; // the soil line, shared by every clump

/** นาข้าว: a flooded paddy with mud banks and rows of swaying rice. */
export const item: ItemModel = {
  id: 'rice-paddy',
  name: 'นาข้าว',
  category: 'nature',
  footprint: { w: 2, d: 3 },
  build: (kit) => {
    const parts: Part[] = [
      kit.box([2 * HALF_X - 2 * BANK.w, WATER_H, 2 * HALF_Z - 2 * BANK.w], [0, WATER_H / 2, 0], 'navy', { motion: WATER }),
      // outer banks
      kit.box([2 * HALF_X, BANK.h, BANK.w], [0, BANK.h / 2, HALF_Z - BANK.w / 2], 'woodDark'),
      kit.box([2 * HALF_X, BANK.h, BANK.w], [0, BANK.h / 2, -HALF_Z + BANK.w / 2], 'woodDark'),
      kit.box([BANK.w, BANK.h, 2 * HALF_Z - 2 * BANK.w], [HALF_X - BANK.w / 2, BANK.h / 2, 0], 'woodDark'),
      kit.box([BANK.w, BANK.h, 2 * HALF_Z - 2 * BANK.w], [-HALF_X + BANK.w / 2, BANK.h / 2, 0], 'woodDark'),
    ];
    for (const z of DIVIDERS) parts.push(kit.box([2 * HALF_X - 2 * BANK.w, BANK.h, BANK.w], [0, BANK.h / 2, z], 'woodDark'));
    // a flat clay top on the banks so they read as walkways
    parts.push(kit.box([2 * HALF_X, 0.012, 0.05], [0, BANK.h + 0.006, HALF_Z - BANK.w / 2], 'wood'));
    parts.push(kit.box([0.05, 0.012, 2 * HALF_Z - 2 * BANK.w], [HALF_X - BANK.w / 2, BANK.h + 0.006, 0], 'wood'));

    ROWS_Z.forEach((z, r) => {
      COLS_X.forEach((x, c) => {
        const tone: PaletteColor = (r + c) % 2 === 0 ? 'leaf' : 'lime';
        const jitter = ((r * 3 + c * 5) % 4) * 0.01; // fixed, no randomness
        parts.push(
          kit.cone(CLUMP.r, CLUMP.h, [x, WATER_H + CLUMP.h / 2, z + jitter], tone, { segments: 5, motion: SWAY }),
          kit.cone(CLUMP.r2, CLUMP.h2, [x + 0.05, WATER_H + CLUMP.h2 / 2, z + 0.04], tone === 'leaf' ? 'lime' : 'leafDark', { segments: 5, motion: SWAY }),
        );
      });
    });
    return kit.finish(parts);
  },
};
