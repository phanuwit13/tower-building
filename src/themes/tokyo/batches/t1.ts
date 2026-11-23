import type { ItemModel } from '../../../models/contract';
import { item as tokyoTower } from '../items/tokyo-tower';
import { item as fiveStoreyPagoda } from '../items/five-storey-pagoda';
import { item as japaneseTemple } from '../items/japanese-temple';
import { item as japaneseGarden } from '../items/japanese-garden';
import { item as stoneLanterns } from '../items/stone-lanterns';
import { item as redBridge } from '../items/red-bridge';
import { item as shishiOdoshi } from '../items/shishi-odoshi';
import { item as rockAndMoss } from '../items/rock-and-moss';
import { item as japanesePine } from '../items/japanese-pine';

/**
 * Tokyo batch t1 (the Batch column of docs/game/items-tokyo.md):
 * tokyo-tower, five-storey-pagoda, japanese-temple, japanese-garden, stone-lanterns, red-bridge, shishi-odoshi, rock-and-moss, japanese-pine.
 * Owned by the t1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=tokyo-batch-1` on the dev server. Check: `npx vitest run src/themes/tokyo/batches/t1.test.ts`.
 */
export const items: readonly ItemModel[] = [
  tokyoTower,
  fiveStoreyPagoda,
  japaneseTemple,
  japaneseGarden,
  stoneLanterns,
  redBridge,
  shishiOdoshi,
  rockAndMoss,
  japanesePine,
];
