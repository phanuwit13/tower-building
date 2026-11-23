import type { ItemModel } from '../../../models/contract';

/**
 * Zoo batch z5 (the Batch column of docs/game/items-zoo.md):
 * aquarium, butterfly-house, petting-farm, zoo-cafe, ostrich-pen, bamboo-clump, fish-feeder, garden-lamp.
 * Owned by the z5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=zoo-batch-5` on the dev server. Check: `npx vitest run src/themes/zoo/batches/z5.test.ts`.
 */
export const items: readonly ItemModel[] = [];
