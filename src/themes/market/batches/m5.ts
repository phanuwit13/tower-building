import type { ItemModel } from '../../../models/contract';
import { item as parkingLot } from '../items/parking-lot';
import { item as shophouseRow } from '../items/shophouse-row';
import { item as barberShop } from '../items/barber-shop';
import { item as noodleShop } from '../items/noodle-shop';
import { item as bikeRack } from '../items/bike-rack';
import { item as breadBike } from '../items/bread-bike';
import { item as streetClock } from '../items/street-clock';
import { item as parkedBike } from '../items/parked-bike';
import { item as balloonStand } from '../items/balloon-stand';

/**
 * Market batch m5 (the Batch column of docs/game/items-market.md):
 * parking-lot, shophouse-row, barber-shop, noodle-shop, bike-rack, bread-bike, street-clock, parked-bike, balloon-stand.
 * Owned by the m5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=market-batch-5` on the dev server. Check: `npx vitest run src/themes/market/batches/m5.test.ts`.
 */
export const items: readonly ItemModel[] = [
  parkingLot,
  shophouseRow,
  barberShop,
  noodleShop,
  bikeRack,
  breadBike,
  streetClock,
  parkedBike,
  balloonStand,
];
