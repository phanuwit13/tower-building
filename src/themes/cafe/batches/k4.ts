import type { ItemModel } from '../../../models/contract';

/**
 * Café batch k4 (the Batch column of docs/game/items-cafe.md):
 * open-kitchen, bread-shelf, smoothie-bar, donut-shelf, tea-party-table, condiment-station, coffee-sacks, water-dispenser, hand-sink.
 * Owned by the k4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=cafe-batch-4` on the dev server. Check: `npx vitest run src/themes/cafe/batches/k4.test.ts`.
 */
export const items: readonly ItemModel[] = [];
