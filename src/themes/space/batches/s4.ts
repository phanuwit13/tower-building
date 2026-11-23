import type { ItemModel } from '../../../models/contract';

/**
 * Space batch s4 (the Batch column of docs/game/items-space.md):
 * rover-garage, cargo-lander, moon-rover, moon-buggy, hover-sled, drone-pad, cargo-robot, rover-charger, robot-dog.
 * Owned by the s4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=space-batch-4` on the dev server. Check: `npx vitest run src/themes/space/batches/s4.test.ts`.
 */
export const items: readonly ItemModel[] = [];
