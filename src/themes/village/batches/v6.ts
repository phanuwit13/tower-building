import type { ItemModel } from '../../../models/contract';

/**
 * Village batch v6 (the Batch column of docs/game/items-village.md):
 * village-hall, takraw-court, mushroom-house, roadside-sala, ox-cart, loudspeaker-pole, lantern-post, swing.
 * Owned by the v6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=village-batch-6` on the dev server. Check: `npx vitest run src/themes/village/batches/v6.test.ts`.
 */
export const items: readonly ItemModel[] = [];
