import type { ItemModel } from '../../../models/contract';

/**
 * Park batch p5 (the Batch column of docs/game/items-park.md):
 * greenhouse, flame-tree, pergola, squirrel-tree, pink-trumpet-tree, fan-palm, pigeons, bird-house.
 * Owned by the p5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=park-batch-5` on the dev server. Check: `npx vitest run src/themes/park/batches/p5.test.ts`.
 */
export const items: readonly ItemModel[] = [];
