import type { ItemModel } from '../../../models/contract';
import { item as aquarium_wall } from '../items/aquarium-wall';
import { item as booth_seats } from '../items/booth-seats';
import { item as drinks_fridge } from '../items/drinks-fridge';
import { item as ice_cream_freezer } from '../items/ice-cream-freezer';
import { item as high_table_stools } from '../items/high-table-stools';
import { item as bin_trio } from '../items/bin-trio';
import { item as fish_bowl } from '../items/fish-bowl';
import { item as menu_easel } from '../items/menu-easel';

/**
 * Café batch k5 (the Batch column of docs/game/items-cafe.md):
 * aquarium-wall, booth-seats, drinks-fridge, ice-cream-freezer, high-table-stools, bin-trio, fish-bowl, menu-easel.
 * Owned by the k5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=cafe-batch-5` on the dev server. Check: `npx vitest run src/themes/cafe/batches/k5.test.ts`.
 */
export const items: readonly ItemModel[] = [aquarium_wall, booth_seats, drinks_fridge, ice_cream_freezer, high_table_stools, bin_trio, fish_bowl, menu_easel];
