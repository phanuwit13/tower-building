import type { ItemModel } from '../../../models/contract';

/**
 * Hospital batch h6 (the Batch column of docs/game/items-hospital.md):
 * pharmacy-counter, lab-bench, supply-room, linen-cart, food-trolley, cleaning-cart, fire-extinguisher, wet-floor-sign.
 * Owned by the h6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=hospital-batch-6` on the dev server. Check: `npx vitest run src/themes/hospital/batches/h6.test.ts`.
 */
export const items: readonly ItemModel[] = [];
