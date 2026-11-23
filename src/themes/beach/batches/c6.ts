import type { ItemModel } from '../../../models/contract';

/**
 * Beach batch c6 (the Batch column of docs/game/items-beach.md):
 * beach-hotel, pirate-play-ship, float-raft, bonfire, flamingo-float, jet-ski, seagull-post, coconut-pile, mini-umbrella.
 * Owned by the c6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=beach-batch-6` on the dev server. Check: `npx vitest run src/themes/beach/batches/c6.test.ts`.
 */
export const items: readonly ItemModel[] = [];
