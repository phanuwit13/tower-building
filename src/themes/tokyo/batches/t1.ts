import type { ItemModel } from '../../../models/contract';

/**
 * Tokyo batch t1 (the Batch column of docs/game/items-tokyo.md):
 * tokyo-tower, five-storey-pagoda, japanese-temple, japanese-garden, stone-lanterns, red-bridge, shishi-odoshi, rock-and-moss, japanese-pine.
 * Owned by the t1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=tokyo-batch-1` on the dev server. Check: `npx vitest run src/themes/tokyo/batches/t1.test.ts`.
 */
export const items: readonly ItemModel[] = [];
