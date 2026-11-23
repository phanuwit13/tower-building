import type { ItemModel } from '../../../models/contract';
import { item as greenhouse } from '../items/greenhouse';
import { item as flameTree } from '../items/flame-tree';
import { item as pergola } from '../items/pergola';
import { item as squirrelTree } from '../items/squirrel-tree';
import { item as pinkTrumpetTree } from '../items/pink-trumpet-tree';
import { item as fanPalm } from '../items/fan-palm';
import { item as pigeons } from '../items/pigeons';
import { item as birdHouse } from '../items/bird-house';

/**
 * Park batch p5 (the Batch column of docs/game/items-park.md):
 * greenhouse, flame-tree, pergola, squirrel-tree, pink-trumpet-tree, fan-palm, pigeons, bird-house.
 * Owned by the p5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=park-batch-5` on the dev server. Check: `npx vitest run src/themes/park/batches/p5.test.ts`.
 */
export const items: readonly ItemModel[] = [
  greenhouse,
  flameTree,
  pergola,
  squirrelTree,
  pinkTrumpetTree,
  fanPalm,
  pigeons,
  birdHouse,
];
