import type { ItemModel } from '../../../models/contract';
import { item as pirate_ship } from '../items/pirate-ship';
import { item as log_flume } from '../items/log-flume';
import { item as bouncy_castle } from '../items/bouncy-castle';
import { item as cotton_candy } from '../items/cotton-candy';
import { item as popcorn_stand } from '../items/popcorn-stand';
import { item as hotdog_stand } from '../items/hotdog-stand';
import { item as topiary_animal } from '../items/topiary-animal';
import { item as flower_tub } from '../items/flower-tub';
import { item as bubble_machine } from '../items/bubble-machine';

/**
 * Amusement batch a3 (the Batch column of docs/game/items-amusement.md):
 * pirate-ship, log-flume, bouncy-castle, cotton-candy, popcorn-stand, hotdog-stand, topiary-animal, flower-tub, bubble-machine.
 * Owned by the a3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); list them here in doc order.
 * Review: `?gallery=amusement-batch-3` on the dev server. Check: `npx vitest run src/themes/amusement/batches/a3.test.ts`.
 */
export const items: readonly ItemModel[] = [pirate_ship, log_flume, bouncy_castle, cotton_candy, popcorn_stand, hotdog_stand, topiary_animal, flower_tub, bubble_machine];
