import type { ItemModel } from '../../../models/contract';

/**
 * Park batch p6 (the Batch column of docs/game/items-park.md):
 * picnic-lawn, gazebo, ice-cream-kiosk, chess-tables, park-bench, picnic-table, coconut-ice-cream-cart, lamp-post.
 * Owned by the p6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=park-batch-6` on the dev server. Check: `npx vitest run src/themes/park/batches/p6.test.ts`.
 */
export const items: readonly ItemModel[] = [];
