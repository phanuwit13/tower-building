import type { ItemModel } from '../../../models/contract';
import { item as village_hall } from '../items/village-hall';
import { item as takraw_court } from '../items/takraw-court';
import { item as mushroom_house } from '../items/mushroom-house';
import { item as roadside_sala } from '../items/roadside-sala';
import { item as ox_cart } from '../items/ox-cart';
import { item as loudspeaker_pole } from '../items/loudspeaker-pole';
import { item as lantern_post } from '../items/lantern-post';
import { item as swing } from '../items/swing';

/**
 * Village batch v6 (the Batch column of docs/game/items-village.md):
 * village-hall, takraw-court, mushroom-house, roadside-sala, ox-cart, loudspeaker-pole, lantern-post, swing.
 * Owned by the v6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=village-batch-6` on the dev server. Check: `npx vitest run src/themes/village/batches/v6.test.ts`.
 */
export const items: readonly ItemModel[] = [
  village_hall,
  takraw_court,
  mushroom_house,
  roadside_sala,
  ox_cart,
  loudspeaker_pole,
  lantern_post,
  swing,
];
