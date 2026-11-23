import type { ItemModel } from '../../../models/contract';

/**
 * Beach batch c4 (the Batch column of docs/game/items-beach.md):
 * beach-bungalow, rock-pool, sea-swing, pedal-boat, beach-buggy, fish-bin, tiki-torch, anchor.
 * Owned by the c4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=beach-batch-4` on the dev server. Check: `npx vitest run src/themes/beach/batches/c4.test.ts`.
 */
export const items: readonly ItemModel[] = [];
