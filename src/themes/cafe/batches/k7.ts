import type { ItemModel } from '../../../models/contract';
import { item as longTable } from '../items/long-table';
import { item as catTower } from '../items/cat-tower';
import { item as restrooms } from '../items/restrooms';
import { item as plantLadder } from '../items/plant-ladder';
import { item as planterBox } from '../items/planter-box';
import { item as cactusTrio } from '../items/cactus-trio';
import { item as catBasket } from '../items/cat-basket';
import { item as dogBed } from '../items/dog-bed';

/**
 * Café batch k7 (the Batch column of docs/game/items-cafe.md):
 * long-table, cat-tower, restrooms, plant-ladder, planter-box, cactus-trio, cat-basket, dog-bed.
 * Owned by the k7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=cafe-batch-7` on the dev server. Check: `npx vitest run src/themes/cafe/batches/k7.test.ts`.
 */
export const items: readonly ItemModel[] = [longTable, catTower, restrooms, plantLadder, planterBox, cactusTrio, catBasket, dogBed];
