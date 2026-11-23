import type { FootprintMix } from '../game/types';

/** Tuned by simulation on the 20 x 20 map (src/game/simulate.test.ts); 50 items. The School mix. */
export const DEFAULT_MIX: FootprintMix = { '1x1': 16, '1x2': 14, '2x2': 12, '2x3': 8 };

/** The Amusement park mix (docs/game/items-amusement.md, 53 items); checked by the same simulation. */
export const AMUSEMENT_MIX: FootprintMix = { '1x1': 16, '1x2': 15, '2x2': 12, '2x3': 10 };

/** The Zoo mix (docs/game/items-zoo.md, 60 items); checked by the same simulation. */
export const ZOO_MIX: FootprintMix = { '1x1': 19, '1x2': 17, '2x2': 14, '2x3': 10 };

/** The Beach mix (docs/game/items-beach.md, 60 items); the same footprints as the zoo, checked by the same simulation. */
export const BEACH_MIX: FootprintMix = { '1x1': 19, '1x2': 17, '2x2': 14, '2x3': 10 };

/** The Shopping district mix (docs/game/items-market.md, 70 items: more small shops and stalls); checked by the same simulation. */
export const MARKET_MIX: FootprintMix = { '1x1': 22, '1x2': 20, '2x2': 17, '2x3': 11 };

/** The Café mix (docs/game/items-cafe.md, 60 items); the same footprints as the zoo and beach, checked by the same simulation. */
export const CAFE_MIX: FootprintMix = { '1x1': 19, '1x2': 17, '2x2': 14, '2x3': 10 };

/** The Village mix (docs/game/items-village.md, 60 items); the same footprints as the zoo, beach and café, checked by the same simulation. */
export const VILLAGE_MIX: FootprintMix = { '1x1': 19, '1x2': 17, '2x2': 14, '2x3': 10 };

/** The Park mix (docs/game/items-park.md, 60 items); the shared 60-item footprints, checked by the same simulation. */
export const PARK_MIX: FootprintMix = { '1x1': 19, '1x2': 17, '2x2': 14, '2x3': 10 };

/** The Tokyo mix (docs/game/items-tokyo.md, 60 items); the shared 60-item footprints, checked by the same simulation. */
export const TOKYO_MIX: FootprintMix = { '1x1': 19, '1x2': 17, '2x2': 14, '2x3': 10 };
