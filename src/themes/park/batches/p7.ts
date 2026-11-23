import type { ItemModel } from '../../../models/contract';

/**
 * Park batch p7 (the Batch column of docs/game/items-park.md):
 * open-air-stage, restroom-block, flower-clock, balloon-cart, telescope-deck, park-tram, park-map, kinetic-sculpture.
 * Owned by the p7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=park-batch-7` on the dev server. Check: `npx vitest run src/themes/park/batches/p7.test.ts`.
 */
export const items: readonly ItemModel[] = [];
