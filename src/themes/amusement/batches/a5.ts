import type { ItemModel } from '../../../models/contract';

/**
 * Amusement batch a5 (the Batch column of docs/game/items-amusement.md):
 * show-stage, train-station, splash-pad, spiral-slide, claw-machines, queue-rails, mini-train, water-jet, balloon-post.
 * Owned by the a5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); list them here in doc order.
 * Review: `?gallery=amusement-batch-5` on the dev server. Check: `npx vitest run src/themes/amusement/batches/a5.test.ts`.
 */
export const items: readonly ItemModel[] = [];
