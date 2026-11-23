import type { ItemModel } from '../../../models/contract';
import { item as kidsCorner } from '../items/kids-corner';
import { item as kidsDrawingTable } from '../items/kids-drawing-table';
import { item as hangingChairs } from '../items/hanging-chairs';
import { item as beanBags } from '../items/bean-bags';
import { item as toyTrain } from '../items/toy-train';
import { item as dessertCart } from '../items/dessert-cart';
import { item as highChair } from '../items/high-chair';
import { item as gumballMachine } from '../items/gumball-machine';
import { item as birthdayCake } from '../items/birthday-cake';

/**
 * Café batch k3 (the Batch column of docs/game/items-cafe.md):
 * kids-corner, kids-drawing-table, hanging-chairs, bean-bags, toy-train, dessert-cart, high-chair, gumball-machine, birthday-cake.
 * Owned by the k3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=cafe-batch-3` on the dev server. Check: `npx vitest run src/themes/cafe/batches/k3.test.ts`.
 */
export const items: readonly ItemModel[] = [kidsCorner, kidsDrawingTable, hangingChairs, beanBags, toyTrain, dessertCart, highChair, gumballMachine, birthdayCake];
