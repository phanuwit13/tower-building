import type { ItemModel } from '../../../models/contract';

/**
 * Amusement batch a1 (the Batch column of docs/game/items-amusement.md):
 * ferris-wheel, carousel, teacups, ticket-booth, ring-toss, light-pole, mascot-bear, frog-bin, park-map.
 * Owned by the a1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); list them here in doc order.
 * Review: `?gallery=amusement-batch-1` on the dev server. Check: `npx vitest run src/themes/amusement/batches/a1.test.ts`.
 */
export const items: readonly ItemModel[] = [];
