import type { ItemModel } from '../../../models/contract';

/**
 * Village batch v3 (the Batch column of docs/game/items-village.md):
 * buffalo-wallow, chicken-coop, cow-pen, pig-pen, goats, hen-and-chicks, ducks, village-dog, woodpile.
 * Owned by the v3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=village-batch-3` on the dev server. Check: `npx vitest run src/themes/village/batches/v3.test.ts`.
 */
export const items: readonly ItemModel[] = [];
