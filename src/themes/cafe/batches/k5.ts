import type { ItemModel } from '../../../models/contract';

/**
 * Café batch k5 (the Batch column of docs/game/items-cafe.md):
 * aquarium-wall, booth-seats, drinks-fridge, ice-cream-freezer, high-table-stools, bin-trio, fish-bowl, menu-easel.
 * Owned by the k5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=cafe-batch-5` on the dev server. Check: `npx vitest run src/themes/cafe/batches/k5.test.ts`.
 */
export const items: readonly ItemModel[] = [];
