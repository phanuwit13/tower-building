import type { ItemModel } from '../../../models/contract';

/**
 * Café batch k3 (the Batch column of docs/game/items-cafe.md):
 * kids-corner, kids-drawing-table, hanging-chairs, bean-bags, toy-train, dessert-cart, high-chair, gumball-machine, birthday-cake.
 * Owned by the k3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=cafe-batch-3` on the dev server. Check: `npx vitest run src/themes/cafe/batches/k3.test.ts`.
 */
export const items: readonly ItemModel[] = [];
