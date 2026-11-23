import type { ItemModel } from '../../../models/contract';

/**
 * Space batch s3 (the Batch column of docs/game/items-space.md):
 * observatory, lab-module, telescope-array, radar-dish, satellite-stand, star-telescope, mini-dish, sensor-pole, antenna.
 * Owned by the s3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=space-batch-3` on the dev server. Check: `npx vitest run src/themes/space/batches/s3.test.ts`.
 */
export const items: readonly ItemModel[] = [];
