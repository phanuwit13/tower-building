import type { ItemModel } from '../../../models/contract';

/**
 * Tokyo batch t6 (the Batch column of docs/game/items-tokyo.md):
 * arcade-center, cat-cafe, tea-house, koinobori-pole, lantern-row, wagasa-stand, shiba-dog, calico-cat.
 * Owned by the t6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=tokyo-batch-6` on the dev server. Check: `npx vitest run src/themes/tokyo/batches/t6.test.ts`.
 */
export const items: readonly ItemModel[] = [];
