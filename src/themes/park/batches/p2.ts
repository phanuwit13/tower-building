import type { ItemModel } from '../../../models/contract';

/**
 * Park batch p2 (the Batch column of docs/game/items-park.md):
 * playground, sandpit, climbing-dome, seesaw, slide, swings, spring-riders, mushroom-stools, park-dog.
 * Owned by the p2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=park-batch-2` on the dev server. Check: `npx vitest run src/themes/park/batches/p2.test.ts`.
 */
export const items: readonly ItemModel[] = [];
