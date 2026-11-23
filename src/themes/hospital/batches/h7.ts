import type { ItemModel } from '../../../models/contract';

/**
 * Hospital batch h7 (the Batch column of docs/game/items-hospital.md):
 * hospital-cafe, elevator-lobby, aquarium-tank, plant-planter, recycle-bins, air-purifier, toy-mobile, balloon-bunch.
 * Owned by the h7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=hospital-batch-7` on the dev server. Check: `npx vitest run src/themes/hospital/batches/h7.test.ts`.
 */
export const items: readonly ItemModel[] = [];
