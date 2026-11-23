import type { FootprintMix } from '../game/types';

/** Tuned by simulation on the 20 x 20 map (src/game/simulate.test.ts); 50 items. The School mix. */
export const DEFAULT_MIX: FootprintMix = { '1x1': 16, '1x2': 14, '2x2': 12, '2x3': 8 };

/** The Amusement park mix (docs/game/items-amusement.md, 53 items); checked by the same simulation. */
export const AMUSEMENT_MIX: FootprintMix = { '1x1': 16, '1x2': 15, '2x2': 12, '2x3': 10 };

/** The Zoo mix (docs/game/items-zoo.md, 60 items); checked by the same simulation. */
export const ZOO_MIX: FootprintMix = { '1x1': 19, '1x2': 17, '2x2': 14, '2x3': 10 };
