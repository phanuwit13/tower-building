import type { ItemModel } from '../../../models/contract';

/**
 * Beach batch c5 (the Batch column of docs/game/items-beach.md):
 * water-slide, volleyball-court, beach-pavilion, shell-ice-cream, bbq-grill, welcome-sign, surfboard, sand-flag.
 * Owned by the c5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=beach-batch-5` on the dev server. Check: `npx vitest run src/themes/beach/batches/c5.test.ts`.
 */
export const items: readonly ItemModel[] = [];
