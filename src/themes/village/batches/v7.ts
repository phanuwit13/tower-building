import type { ItemModel } from '../../../models/contract';

/**
 * Village batch v7 (the Batch column of docs/game/items-village.md):
 * banana-grove, rain-tree, vegetable-garden, laundry-line, bamboo-fence, marigold-patch, mango-tree, coconut-palm.
 * Owned by the v7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=village-batch-7` on the dev server. Check: `npx vitest run src/themes/village/batches/v7.test.ts`.
 */
export const items: readonly ItemModel[] = [];
