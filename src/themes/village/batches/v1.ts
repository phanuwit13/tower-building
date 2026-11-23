import type { ItemModel } from '../../../models/contract';

/**
 * Village batch v1 (the Batch column of docs/game/items-village.md):
 * stilt-house, grocery-shop, rice-barn, field-hut, water-tower, bamboo-bench, hammock, well, mailbox.
 * Owned by the v1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=village-batch-1` on the dev server. Check: `npx vitest run src/themes/village/batches/v1.test.ts`.
 */
export const items: readonly ItemModel[] = [];
