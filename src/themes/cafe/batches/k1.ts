import type { ItemModel } from '../../../models/contract';
import { item as barista_counter } from '../items/barista-counter';
import { item as cake_display } from '../items/cake-display';
import { item as round_table_four } from '../items/round-table-four';
import { item as cashier_counter } from '../items/cashier-counter';
import { item as table_for_two } from '../items/table-for-two';
import { item as cushion_bench } from '../items/cushion-bench';
import { item as coffee_cart } from '../items/coffee-cart';
import { item as stool } from '../items/stool';
import { item as potted_plant } from '../items/potted-plant';

/**
 * Café batch k1 (the Batch column of docs/game/items-cafe.md):
 * barista-counter, cake-display, round-table-four, cashier-counter, table-for-two, cushion-bench, coffee-cart, stool, potted-plant.
 * Owned by the k1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=cafe-batch-1` on the dev server. Check: `npx vitest run src/themes/cafe/batches/k1.test.ts`.
 */
export const items: readonly ItemModel[] = [barista_counter, cake_display, round_table_four, cashier_counter, table_for_two, cushion_bench, coffee_cart, stool, potted_plant];
