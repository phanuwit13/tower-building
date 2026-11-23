import type { ItemModel } from '../../../models/contract';

/**
 * Village batch v5 (the Batch column of docs/game/items-village.md):
 * village-market, coffee-stall, som-tam-stall, fruit-stall, bamboo-rice-grill, sidecar-motorbike, clay-stove, bicycle.
 * Owned by the v5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=village-batch-5` on the dev server. Check: `npx vitest run src/themes/village/batches/v5.test.ts`.
 */
export const items: readonly ItemModel[] = [];
