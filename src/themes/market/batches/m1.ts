import type { ItemModel } from '../../../models/contract';
import { item as bakery } from '../items/bakery';
import { item as coffeeCart } from '../items/coffee-cart';
import { item as departmentStore } from '../items/department-store';
import { item as foodTruck } from '../items/food-truck';
import { item as fruitStall } from '../items/fruit-stall';
import { item as iceCreamParlour } from '../items/ice-cream-parlour';
import { item as streetLamp } from '../items/street-lamp';
import { item as supermarket } from '../items/supermarket';
import { item as trashBin } from '../items/trash-bin';

/**
 * Market batch m1 (the Batch column of docs/game/items-market.md):
 * department-store, supermarket, bakery, ice-cream-parlour, coffee-cart, food-truck, fruit-stall, street-lamp, trash-bin.
 * Owned by the m1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=market-batch-1` on the dev server. Check: `npx vitest run src/themes/market/batches/m1.test.ts`.
 */
export const items: readonly ItemModel[] = [departmentStore, supermarket, bakery, iceCreamParlour, coffeeCart, foodTruck, fruitStall, streetLamp, trashBin];
