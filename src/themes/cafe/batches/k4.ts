import type { ItemModel } from '../../../models/contract';
import { item as openKitchen } from '../items/open-kitchen';
import { item as breadShelf } from '../items/bread-shelf';
import { item as smoothieBar } from '../items/smoothie-bar';
import { item as donutShelf } from '../items/donut-shelf';
import { item as teaPartyTable } from '../items/tea-party-table';
import { item as condimentStation } from '../items/condiment-station';
import { item as coffeeSacks } from '../items/coffee-sacks';
import { item as waterDispenser } from '../items/water-dispenser';
import { item as handSink } from '../items/hand-sink';

/**
 * Café batch k4 (the Batch column of docs/game/items-cafe.md):
 * open-kitchen, bread-shelf, smoothie-bar, donut-shelf, tea-party-table, condiment-station, coffee-sacks, water-dispenser, hand-sink.
 * Owned by the k4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=cafe-batch-4` on the dev server. Check: `npx vitest run src/themes/cafe/batches/k4.test.ts`.
 */
export const items: readonly ItemModel[] = [openKitchen, breadShelf, smoothieBar, donutShelf, teaPartyTable, condimentStation, coffeeSacks, waterDispenser, handSink];
