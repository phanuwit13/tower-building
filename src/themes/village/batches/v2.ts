import type { ItemModel } from '../../../models/contract';

/**
 * Village batch v2 (the Batch column of docs/game/items-village.md):
 * rice-paddy, rice-mill, drying-yard, haystacks, walking-tractor, farm-truck, scarecrow, pinwheel, water-buffalo.
 * Owned by the v2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=village-batch-2` on the dev server. Check: `npx vitest run src/themes/village/batches/v2.test.ts`.
 */
export const items: readonly ItemModel[] = [];
