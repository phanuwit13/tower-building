import type { ItemModel } from '../../../models/contract';

/**
 * Beach batch c1 (the Batch column of docs/game/items-beach.md):
 * pier, lighthouse, sandcastle, lifeguard-tower, sunloungers, umbrella-mat, longtail-boat, palm-tree, sand-bucket.
 * Owned by the c1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=beach-batch-1` on the dev server. Check: `npx vitest run src/themes/beach/batches/c1.test.ts`.
 */
export const items: readonly ItemModel[] = [];
