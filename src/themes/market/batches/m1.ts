import type { ItemModel } from '../../../models/contract';

/**
 * Market batch m1 (the Batch column of docs/game/items-market.md):
 * department-store, supermarket, bakery, ice-cream-parlour, coffee-cart, food-truck, fruit-stall, street-lamp, trash-bin.
 * Owned by the m1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=market-batch-1` on the dev server. Check: `npx vitest run src/themes/market/batches/m1.test.ts`.
 */
export const items: readonly ItemModel[] = [];
