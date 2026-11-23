import type { ItemModel } from '../../../models/contract';

/**
 * Space batch s1 (the Batch column of docs/game/items-space.md):
 * launch-pad, spaceport-runway, fuel-tanks, landing-pad-small, mini-rocket, lunar-lander, fuel-pump, beacon, mission-sign.
 * Owned by the s1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=space-batch-1` on the dev server. Check: `npx vitest run src/themes/space/batches/s1.test.ts`.
 */
export const items: readonly ItemModel[] = [];
