import type { ItemModel } from '../../../models/contract';
import { item as beach_pool } from '../items/beach-pool';
import { item as surf_shop } from '../items/surf-shop';
import { item as changing_rooms } from '../items/changing-rooms';
import { item as beach_fruit_cart } from '../items/beach-fruit-cart';
import { item as dive_shop } from '../items/dive-shop';
import { item as towel_rack } from '../items/towel-rack';
import { item as little_crab } from '../items/little-crab';
import { item as turtle_nest } from '../items/turtle-nest';
import { item as lifebuoy_post } from '../items/lifebuoy-post';

/**
 * Beach batch c3 (the Batch column of docs/game/items-beach.md):
 * beach-pool, surf-shop, changing-rooms, beach-fruit-cart, dive-shop, towel-rack, little-crab, turtle-nest, lifebuoy-post.
 * Owned by the c3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=beach-batch-3` on the dev server. Check: `npx vitest run src/themes/beach/batches/c3.test.ts`.
 */
export const items: readonly ItemModel[] = [
  beach_pool,
  surf_shop,
  changing_rooms,
  beach_fruit_cart,
  dive_shop,
  towel_rack,
  little_crab,
  turtle_nest,
  lifebuoy_post,
];
