import type { ItemModel } from '../../../models/contract';
import { item as grandCafe } from '../items/grand-cafe';
import { item as clothingShop } from '../items/clothing-shop';
import { item as shoeShop } from '../items/shoe-shop';
import { item as cityBusStop } from '../items/city-bus-stop';
import { item as phoneBooth } from '../items/phone-booth';
import { item as streetBench } from '../items/street-bench';
import { item as pottedPlant } from '../items/potted-plant';
import { item as patioUmbrella } from '../items/patio-umbrella';
import { item as sidewalkTable } from '../items/sidewalk-table';

/**
 * Market batch m3 (the Batch column of docs/game/items-market.md):
 * grand-cafe, clothing-shop, shoe-shop, city-bus-stop, phone-booth, street-bench, potted-plant, patio-umbrella, sidewalk-table.
 * Owned by the m3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=market-batch-3` on the dev server. Check: `npx vitest run src/themes/market/batches/m3.test.ts`.
 */
export const items: readonly ItemModel[] = [
  grandCafe,
  clothingShop,
  shoeShop,
  cityBusStop,
  phoneBooth,
  streetBench,
  pottedPlant,
  patioUmbrella,
  sidewalkTable,
];
