import type { ItemModel } from '../../../models/contract';

/**
 * Café batch k2 (the Batch column of docs/game/items-cafe.md):
 * sofa-lounge, book-nook, armchairs-pair, board-game-table, bookshelf, loveseat, floor-lamp, rocking-chair, vase-table.
 * Owned by the k2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=cafe-batch-2` on the dev server. Check: `npx vitest run src/themes/cafe/batches/k2.test.ts`.
 */
export const items: readonly ItemModel[] = [];
