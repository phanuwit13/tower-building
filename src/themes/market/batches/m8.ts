import type { ItemModel } from '../../../models/contract';

/**
 * Market batch m8 (the Batch column of docs/game/items-market.md):
 * electronics-store, plant-nursery, thai-dessert-shop, laundromat, toy-stall, umbrella-stall, sale-star, hanging-planter.
 * Owned by the m8 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=market-batch-8` on the dev server. Check: `npx vitest run src/themes/market/batches/m8.test.ts`.
 */
export const items: readonly ItemModel[] = [];
