import type { ItemModel } from '../../../models/contract';

/**
 * Amusement batch a3 (the Batch column of docs/game/items-amusement.md):
 * pirate-ship, log-flume, bouncy-castle, cotton-candy, popcorn-stand, hotdog-stand, topiary-animal, flower-tub, bubble-machine.
 * Owned by the a3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); list them here in doc order.
 * Review: `?gallery=amusement-batch-3` on the dev server. Check: `npx vitest run src/themes/amusement/batches/a3.test.ts`.
 */
export const items: readonly ItemModel[] = [];
