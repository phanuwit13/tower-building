import type { ItemModel } from '../../../models/contract';

/**
 * Beach batch c3 (the Batch column of docs/game/items-beach.md):
 * beach-pool, surf-shop, changing-rooms, beach-fruit-cart, dive-shop, towel-rack, little-crab, turtle-nest, lifebuoy-post.
 * Owned by the c3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=beach-batch-3` on the dev server. Check: `npx vitest run src/themes/beach/batches/c3.test.ts`.
 */
export const items: readonly ItemModel[] = [];
