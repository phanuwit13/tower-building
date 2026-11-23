import type { ItemModel } from '../../../models/contract';
import { item as night_market } from '../items/night-market';
import { item as bubble_tea_shop } from '../items/bubble-tea-shop';
import { item as donut_shop } from '../items/donut-shop';
import { item as tuk_tuk } from '../items/tuk-tuk';
import { item as flower_cart } from '../items/flower-cart';
import { item as clothes_stall } from '../items/clothes-stall';
import { item as street_tree } from '../items/street-tree';
import { item as fruit_basket } from '../items/fruit-basket';
import { item as veg_crate } from '../items/veg-crate';

/**
 * Market batch m6 (the Batch column of docs/game/items-market.md):
 * night-market, bubble-tea-shop, donut-shop, tuk-tuk, flower-cart, clothes-stall, street-tree, fruit-basket, veg-crate.
 * Owned by the m6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=market-batch-6` on the dev server. Check: `npx vitest run src/themes/market/batches/m6.test.ts`.
 */
export const items: readonly ItemModel[] = [night_market, bubble_tea_shop, donut_shop, tuk_tuk, flower_cart, clothes_stall, street_tree, fruit_basket, veg_crate];
