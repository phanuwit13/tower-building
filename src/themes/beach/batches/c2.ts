import type { ItemModel } from '../../../models/contract';

/**
 * Beach batch c2 (the Batch column of docs/game/items-beach.md):
 * sailboat-dock, seafood-restaurant, kayak-rack, coconut-bar, palm-hammock, boardwalk-bench, beach-ball, starfish, giant-shell.
 * Owned by the c2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=beach-batch-2` on the dev server. Check: `npx vitest run src/themes/beach/batches/c2.test.ts`.
 */
export const items: readonly ItemModel[] = [];
