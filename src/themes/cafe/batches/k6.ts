import type { ItemModel } from '../../../models/contract';

/**
 * Café batch k6 (the Batch column of docs/game/items-cafe.md):
 * music-corner, coffee-roaster, flower-wall, piano, bicycle-display, jukebox, grandfather-clock, coat-rack.
 * Owned by the k6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=cafe-batch-6` on the dev server. Check: `npx vitest run src/themes/cafe/batches/k6.test.ts`.
 */
export const items: readonly ItemModel[] = [];
