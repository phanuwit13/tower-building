import type { ItemModel } from '../../../models/contract';

/**
 * Amusement batch a4 (the Batch column of docs/game/items-amusement.md):
 * bumper-cars, entrance-gate, mirror-maze, kiddie-cars, balloon-stall, photo-booth, face-cutout, shaved-ice-cart, lollipop-sign.
 * Owned by the a4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); list them here in doc order.
 * Review: `?gallery=amusement-batch-4` on the dev server. Check: `npx vitest run src/themes/amusement/batches/a4.test.ts`.
 */
export const items: readonly ItemModel[] = [];
