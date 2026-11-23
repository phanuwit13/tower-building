import type { ItemModel } from '../../../models/contract';
import { item as reception_desk } from '../items/reception-desk';
import { item as waiting_area } from '../items/waiting-area';
import { item as vending_corner } from '../items/vending-corner';
import { item as gift_shop_corner } from '../items/gift-shop-corner';
import { item as bench_seats } from '../items/bench-seats';
import { item as info_kiosk } from '../items/info-kiosk';
import { item as water_dispenser } from '../items/water-dispenser';
import { item as sanitizer_stand } from '../items/sanitizer-stand';
import { item as umbrella_stand } from '../items/umbrella-stand';

/**
 * Hospital batch h1 (the Batch column of docs/game/items-hospital.md):
 * reception-desk, waiting-area, vending-corner, gift-shop-corner, bench-seats, info-kiosk, water-dispenser, sanitizer-stand, umbrella-stand.
 * Owned by the h1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=hospital-batch-1` on the dev server. Check: `npx vitest run src/themes/hospital/batches/h1.test.ts`.
 */
export const items: readonly ItemModel[] = [reception_desk, waiting_area, vending_corner, gift_shop_corner, bench_seats, info_kiosk, water_dispenser, sanitizer_stand, umbrella_stand];
