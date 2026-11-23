import type { ItemModel } from '../../../models/contract';

/**
 * Park batch p4 (the Batch column of docs/game/items-park.md):
 * rose-garden, maze-hedge, topiary-garden, butterfly-garden, flower-bed, hedge-row, round-shrub, rock-garden, sprinkler.
 * Owned by the p4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=park-batch-4` on the dev server. Check: `npx vitest run src/themes/park/batches/p4.test.ts`.
 */
export const items: readonly ItemModel[] = [];
