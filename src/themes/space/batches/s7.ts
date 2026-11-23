import type { ItemModel } from '../../../models/contract';

/**
 * Space batch s7 (the Batch column of docs/game/items-space.md):
 * greenhouse-dome, robot-workshop, ufo-visitor, comms-tower, cargo-crane, crate-stack, alien-buddy, space-plant.
 * Owned by the s7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=space-batch-7` on the dev server. Check: `npx vitest run src/themes/space/batches/s7.test.ts`.
 */
export const items: readonly ItemModel[] = [];
