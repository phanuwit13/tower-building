import type { ItemModel } from '../../../models/contract';

/**
 * Market batch m3 (the Batch column of docs/game/items-market.md):
 * grand-cafe, clothing-shop, shoe-shop, city-bus-stop, phone-booth, street-bench, potted-plant, patio-umbrella, sidewalk-table.
 * Owned by the m3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=market-batch-3` on the dev server. Check: `npx vitest run src/themes/market/batches/m3.test.ts`.
 */
export const items: readonly ItemModel[] = [];
