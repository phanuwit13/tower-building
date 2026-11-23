import type { ItemModel } from '../../../models/contract';

/**
 * Café batch k1 (the Batch column of docs/game/items-cafe.md):
 * barista-counter, cake-display, round-table-four, cashier-counter, table-for-two, cushion-bench, coffee-cart, stool, potted-plant.
 * Owned by the k1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=cafe-batch-1` on the dev server. Check: `npx vitest run src/themes/cafe/batches/k1.test.ts`.
 */
export const items: readonly ItemModel[] = [];
