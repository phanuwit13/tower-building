import type { ItemModel } from '../../../models/contract';
import { item as bookstore } from '../items/bookstore';
import { item as pharmacy } from '../items/pharmacy';
import { item as stationery_shop } from '../items/stationery-shop';
import { item as planter_box } from '../items/planter-box';
import { item as vending_machines } from '../items/vending-machines';
import { item as banner_pole } from '../items/banner-pole';
import { item as gashapon } from '../items/gashapon';
import { item as parking_meter } from '../items/parking-meter';
import { item as shop_cat } from '../items/shop-cat';

/**
 * Market batch m4 (the Batch column of docs/game/items-market.md):
 * bookstore, pharmacy, stationery-shop, planter-box, vending-machines, banner-pole, gashapon, parking-meter, shop-cat.
 * Owned by the m4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=market-batch-4` on the dev server. Check: `npx vitest run src/themes/market/batches/m4.test.ts`.
 */
export const items: readonly ItemModel[] = [bookstore, pharmacy, stationery_shop, planter_box, vending_machines, banner_pole, gashapon, parking_meter, shop_cat];
