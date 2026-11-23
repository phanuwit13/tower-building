import type { ItemModel } from '../../../models/contract';

/**
 * Tokyo batch t5 (the Batch column of docs/game/items-tokyo.md):
 * ramen-alley, sushi-restaurant, fish-market, ramen-stall, takoyaki-stall, crepe-stand, taiyaki-stand, paper-lantern-post.
 * Owned by the t5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=tokyo-batch-5` on the dev server. Check: `npx vitest run src/themes/tokyo/batches/t5.test.ts`.
 */
export const items: readonly ItemModel[] = [];
