import type { ItemModel } from '../../../models/contract';

/**
 * Village batch v4 (the Batch column of docs/game/items-village.md):
 * fish-pond, lotus-pond, waterside-pavilion, footbridge, rowboat, water-jars, hand-pump, firefly-bush, bamboo-clump.
 * Owned by the v4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=village-batch-4` on the dev server. Check: `npx vitest run src/themes/village/batches/v4.test.ts`.
 */
export const items: readonly ItemModel[] = [];
