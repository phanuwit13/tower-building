import type { ItemModel } from '../../../models/contract';

/**
 * Space batch s6 (the Batch column of docs/game/items-space.md):
 * ice-crater, big-crater, moon-rocks, landing-lights, crystal-cluster, moon-boulder, small-crater, meteorite.
 * Owned by the s6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=space-batch-6` on the dev server. Check: `npx vitest run src/themes/space/batches/s6.test.ts`.
 */
export const items: readonly ItemModel[] = [];
