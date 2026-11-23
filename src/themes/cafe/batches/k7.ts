import type { ItemModel } from '../../../models/contract';

/**
 * Café batch k7 (the Batch column of docs/game/items-cafe.md):
 * long-table, cat-tower, restrooms, plant-ladder, planter-box, cactus-trio, cat-basket, dog-bed.
 * Owned by the k7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=cafe-batch-7` on the dev server. Check: `npx vitest run src/themes/cafe/batches/k7.test.ts`.
 */
export const items: readonly ItemModel[] = [];
