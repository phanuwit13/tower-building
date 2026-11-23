import type { ItemModel } from '../../../models/contract';

/**
 * Hospital batch h2 (the Batch column of docs/game/items-hospital.md):
 * kids-ward-beds, playroom, reading-corner, baby-nursery, art-wall, bookshelf-low, toy-car, rocking-horse, teddy-bear.
 * Owned by the h2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=hospital-batch-2` on the dev server. Check: `npx vitest run src/themes/hospital/batches/h2.test.ts`.
 */
export const items: readonly ItemModel[] = [];
