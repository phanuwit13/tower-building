import type { ItemModel } from '../../../models/contract';

/**
 * Space batch s2 (the Batch column of docs/game/items-space.md):
 * habitat-dome, command-center, airlock-hub, space-cafe, tube-corridor, air-tanks, base-lamp, supply-crate, helper-robot.
 * Owned by the s2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=space-batch-2` on the dev server. Check: `npx vitest run src/themes/space/batches/s2.test.ts`.
 */
export const items: readonly ItemModel[] = [];
