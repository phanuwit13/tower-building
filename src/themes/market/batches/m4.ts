import type { ItemModel } from '../../../models/contract';

/**
 * Market batch m4 (the Batch column of docs/game/items-market.md):
 * bookstore, pharmacy, stationery-shop, planter-box, vending-machines, banner-pole, gashapon, parking-meter, shop-cat.
 * Owned by the m4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=market-batch-4` on the dev server. Check: `npx vitest run src/themes/market/batches/m4.test.ts`.
 */
export const items: readonly ItemModel[] = [];
