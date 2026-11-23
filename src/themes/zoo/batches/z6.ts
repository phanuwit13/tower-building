import type { ItemModel } from '../../../models/contract';
import { item as polarBearCove } from '../items/polar-bear-cove';
import { item as zooShop } from '../items/zoo-shop';
import { item as animalClinic } from '../items/animal-clinic';
import { item as turnstiles } from '../items/turnstiles';
import { item as waterTrough } from '../items/water-trough';
import { item as koalaTree } from '../items/koala-tree';
import { item as animalBalloons } from '../items/animal-balloons';
import { item as binoculars } from '../items/binoculars';
import { item as lizardRock } from '../items/lizard-rock';

/**
 * Zoo batch z6 (the Batch column of docs/game/items-zoo.md):
 * polar-bear-cove, zoo-shop, animal-clinic, turnstiles, water-trough, koala-tree, animal-balloons, binoculars, lizard-rock.
 * Owned by the z6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=zoo-batch-6` on the dev server. Check: `npx vitest run src/themes/zoo/batches/z6.test.ts`.
 */
export const items: readonly ItemModel[] = [
  polarBearCove,
  zooShop,
  animalClinic,
  turnstiles,
  waterTrough,
  koalaTree,
  animalBalloons,
  binoculars,
  lizardRock,
];
