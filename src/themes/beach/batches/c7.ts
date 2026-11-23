import type { ItemModel } from '../../../models/contract';
import { item as ferry_dock } from '../items/ferry-dock';
import { item as turtle_nursery } from '../items/turtle-nursery';
import { item as van_cafe } from '../items/van-cafe';
import { item as kite_stall } from '../items/kite-stall';
import { item as squid_grill } from '../items/squid-grill';
import { item as seahorse_statue } from '../items/seahorse-statue';
import { item as buoy } from '../items/buoy';
import { item as sea_pandanus } from '../items/sea-pandanus';

/**
 * Beach batch c7 (the Batch column of docs/game/items-beach.md):
 * ferry-dock, turtle-nursery, van-cafe, kite-stall, squid-grill, seahorse-statue, buoy, sea-pandanus.
 * Owned by the c7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=beach-batch-7` on the dev server. Check: `npx vitest run src/themes/beach/batches/c7.test.ts`.
 */
export const items: readonly ItemModel[] = [
  ferry_dock,
  turtle_nursery,
  van_cafe,
  kite_stall,
  squid_grill,
  seahorse_statue,
  buoy,
  sea_pandanus,
];
