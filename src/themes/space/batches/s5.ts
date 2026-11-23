import type { ItemModel } from '../../../models/contract';

/**
 * Space batch s5 (the Batch column of docs/game/items-space.md):
 * solar-farm, mining-rig, water-recycler, solar-panel-row, battery-bank, ore-conveyor, trash-bot, ice-block.
 * Owned by the s5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=space-batch-5` on the dev server. Check: `npx vitest run src/themes/space/batches/s5.test.ts`.
 */
export const items: readonly ItemModel[] = [];
