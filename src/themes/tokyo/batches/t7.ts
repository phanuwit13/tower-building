import type { ItemModel } from '../../../models/contract';

/**
 * Tokyo batch t7 (the Batch column of docs/game/items-tokyo.md):
 * zen-garden, sakura-grove, bamboo-grove, sakura-bench, bonsai-shelf, sakura-tree, maple-tree, azalea-bush.
 * Owned by the t7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=tokyo-batch-7` on the dev server. Check: `npx vitest run src/themes/tokyo/batches/t7.test.ts`.
 */
export const items: readonly ItemModel[] = [];
