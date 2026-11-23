import type { ItemModel } from '../../../models/contract';
import { item as ramenAlley } from '../items/ramen-alley';
import { item as sushiRestaurant } from '../items/sushi-restaurant';
import { item as fishMarket } from '../items/fish-market';
import { item as ramenStall } from '../items/ramen-stall';
import { item as takoyakiStall } from '../items/takoyaki-stall';
import { item as crepeStand } from '../items/crepe-stand';
import { item as taiyakiStand } from '../items/taiyaki-stand';
import { item as paperLanternPost } from '../items/paper-lantern-post';

/**
 * Tokyo batch t5 (the Batch column of docs/game/items-tokyo.md):
 * ramen-alley, sushi-restaurant, fish-market, ramen-stall, takoyaki-stall, crepe-stand, taiyaki-stand, paper-lantern-post.
 * Owned by the t5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=tokyo-batch-5` on the dev server. Check: `npx vitest run src/themes/tokyo/batches/t5.test.ts`.
 */
export const items: readonly ItemModel[] = [
  ramenAlley,
  sushiRestaurant,
  fishMarket,
  ramenStall,
  takoyakiStall,
  crepeStand,
  taiyakiStand,
  paperLanternPost,
];
