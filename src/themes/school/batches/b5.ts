import type { ItemModel } from '../../../models/contract';
import { item as fruitCart } from '../items/fruit-cart';
import { item as iceCreamCart } from '../items/ice-cream-cart';
import { item as noodleStall } from '../items/noodle-stall';
import { item as stoneTable } from '../items/stone-table';
import { item as tukTuk } from '../items/tuk-tuk';
import { item as umbrellaTable } from '../items/umbrella-table';

/**
 * School batch 5: ice-cream-cart, noodle-stall, fruit-cart, tuk-tuk, umbrella-table, stone-table.
 * Owned by the batch-5 sculptor; do not edit other batches.
 * Review: `?gallery=batch-5` on the dev server. Check: `npx vitest run src/themes/school/batches/b5.test.ts`.
 */
export const items: readonly ItemModel[] = [iceCreamCart, noodleStall, fruitCart, tukTuk, umbrellaTable, stoneTable];
