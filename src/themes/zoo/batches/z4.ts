import type { ItemModel } from '../../../models/contract';

/**
 * Zoo batch z4 (the Batch column of docs/game/items-zoo.md):
 * zoo-gate, flamingo-pond, bird-aviary, otter-stream, camel-pen, duck-tub, banana-crate, flower-bush.
 * Owned by the z4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=zoo-batch-4` on the dev server. Check: `npx vitest run src/themes/zoo/batches/z4.test.ts`.
 */
export const items: readonly ItemModel[] = [];
