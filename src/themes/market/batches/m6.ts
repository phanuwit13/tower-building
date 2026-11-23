import type { ItemModel } from '../../../models/contract';

/**
 * Market batch m6 (the Batch column of docs/game/items-market.md):
 * night-market, bubble-tea-shop, donut-shop, tuk-tuk, flower-cart, clothes-stall, street-tree, fruit-basket, veg-crate.
 * Owned by the m6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=market-batch-6` on the dev server. Check: `npx vitest run src/themes/market/batches/m6.test.ts`.
 */
export const items: readonly ItemModel[] = [];
