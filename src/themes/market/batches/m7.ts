import type { ItemModel } from '../../../models/contract';
import { item as mallFoodCourt } from '../items/mall-food-court';
import { item as opticalShop } from '../items/optical-shop';
import { item as sportsShop } from '../items/sports-shop';
import { item as meatballGrill } from '../items/meatball-grill';
import { item as juiceStall } from '../items/juice-stall';
import { item as cornCart } from '../items/corn-cart';
import { item as shoppingTrolley } from '../items/shopping-trolley';
import { item as marketScale } from '../items/market-scale';

/**
 * Market batch m7 (the Batch column of docs/game/items-market.md):
 * mall-food-court, optical-shop, sports-shop, meatball-grill, juice-stall, corn-cart, shopping-trolley, market-scale.
 * Owned by the m7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=market-batch-7` on the dev server. Check: `npx vitest run src/themes/market/batches/m7.test.ts`.
 */
export const items: readonly ItemModel[] = [mallFoodCourt, opticalShop, sportsShop, meatballGrill, juiceStall, cornCart, shoppingTrolley, marketScale];
