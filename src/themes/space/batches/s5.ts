import type { ItemModel } from '../../../models/contract';
import { item as solarFarm } from '../items/solar-farm';
import { item as miningRig } from '../items/mining-rig';
import { item as waterRecycler } from '../items/water-recycler';
import { item as solarPanelRow } from '../items/solar-panel-row';
import { item as batteryBank } from '../items/battery-bank';
import { item as oreConveyor } from '../items/ore-conveyor';
import { item as trashBot } from '../items/trash-bot';
import { item as iceBlock } from '../items/ice-block';

/**
 * Space batch s5 (the Batch column of docs/game/items-space.md):
 * solar-farm, mining-rig, water-recycler, solar-panel-row, battery-bank, ore-conveyor, trash-bot, ice-block.
 * Owned by the s5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=space-batch-5` on the dev server. Check: `npx vitest run src/themes/space/batches/s5.test.ts`.
 */
export const items: readonly ItemModel[] = [solarFarm, miningRig, waterRecycler, solarPanelRow, batteryBank, oreConveyor, trashBot, iceBlock];
