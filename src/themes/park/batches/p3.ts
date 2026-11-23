import type { ItemModel } from '../../../models/contract';

/**
 * Park batch p3 (the Batch column of docs/game/items-park.md):
 * outdoor-gym, skate-park, basketball-court, bike-rental, jogging-track, bike-rack, trash-bins, vending-machine, signpost.
 * Owned by the p3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=park-batch-3` on the dev server. Check: `npx vitest run src/themes/park/batches/p3.test.ts`.
 */
export const items: readonly ItemModel[] = [];
