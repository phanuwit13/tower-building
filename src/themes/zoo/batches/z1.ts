import type { ItemModel } from '../../../models/contract';

/**
 * Zoo batch z1 (the Batch column of docs/game/items-zoo.md):
 * penguin-pool, giraffe-yard, lion-rock, zebra-paddock, zoo-tram, feed-kiosk, shaded-bench, shade-tree, acacia-tree.
 * Owned by the z1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=zoo-batch-1` on the dev server. Check: `npx vitest run src/themes/zoo/batches/z1.test.ts`.
 */
export const items: readonly ItemModel[] = [];
