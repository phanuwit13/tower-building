import type { ItemModel } from '../../../models/contract';
import { item as roller_coaster } from '../items/roller-coaster';
import { item as swing_ride } from '../items/swing-ride';
import { item as drop_tower } from '../items/drop-tower';
import { item as duck_fishing } from '../items/duck-fishing';
import { item as ice_cream_truck } from '../items/ice-cream-truck';
import { item as height_sign } from '../items/height-sign';
import { item as coin_horse } from '../items/coin-horse';
import { item as coin_rocket } from '../items/coin-rocket';
import { item as umbrella_table } from '../items/umbrella-table';

/**
 * Amusement batch a2 (the Batch column of docs/game/items-amusement.md):
 * roller-coaster, swing-ride, drop-tower, duck-fishing, ice-cream-truck, height-sign, coin-horse, coin-rocket, umbrella-table.
 * Owned by the a2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); list them here in doc order.
 * Review: `?gallery=amusement-batch-2` on the dev server. Check: `npx vitest run src/themes/amusement/batches/a2.test.ts`.
 */
export const items: readonly ItemModel[] = [roller_coaster, swing_ride, drop_tower, duck_fishing, ice_cream_truck, height_sign, coin_horse, coin_rocket, umbrella_table];
