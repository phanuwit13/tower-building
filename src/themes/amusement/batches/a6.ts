import type { ItemModel } from '../../../models/contract';

/**
 * Amusement batch a6 (the Batch column of docs/game/items-amusement.md):
 * haunted-house, giant-house, food-court, souvenir-shop, restrooms, shooting-gallery, parade-float, double-bench.
 * Owned by the a6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); list them here in doc order.
 * Review: `?gallery=amusement-batch-6` on the dev server. Check: `npx vitest run src/themes/amusement/batches/a6.test.ts`.
 */
export const items: readonly ItemModel[] = [];
