import type { ItemModel } from '../../../models/contract';

/**
 * Zoo batch z7 (the Batch column of docs/game/items-zoo.md):
 * rhino-yard, tiger-den, seal-pool, pony-ride, peacock-lawn, sloth-branch, hedgehog-log, toucan-post.
 * Owned by the z7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=zoo-batch-7` on the dev server. Check: `npx vitest run src/themes/zoo/batches/z7.test.ts`.
 */
export const items: readonly ItemModel[] = [];
