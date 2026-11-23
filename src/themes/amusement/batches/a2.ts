import type { ItemModel } from '../../../models/contract';

/**
 * Amusement batch a2 (the Batch column of docs/game/items-amusement.md):
 * roller-coaster, swing-ride, drop-tower, duck-fishing, ice-cream-truck, height-sign, coin-horse, coin-rocket, umbrella-table.
 * Owned by the a2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); list them here in doc order.
 * Review: `?gallery=amusement-batch-2` on the dev server. Check: `npx vitest run src/themes/amusement/batches/a2.test.ts`.
 */
export const items: readonly ItemModel[] = [];
