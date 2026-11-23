import type { ItemModel } from '../../../models/contract';

/**
 * Beach batch c7 (the Batch column of docs/game/items-beach.md):
 * ferry-dock, turtle-nursery, van-cafe, kite-stall, squid-grill, seahorse-statue, buoy, sea-pandanus.
 * Owned by the c7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=beach-batch-7` on the dev server. Check: `npx vitest run src/themes/beach/batches/c7.test.ts`.
 */
export const items: readonly ItemModel[] = [];
