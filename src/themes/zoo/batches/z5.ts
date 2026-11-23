import type { ItemModel } from '../../../models/contract';
import { item as aquarium } from '../items/aquarium';
import { item as bambooClump } from '../items/bamboo-clump';
import { item as butterflyHouse } from '../items/butterfly-house';
import { item as fishFeeder } from '../items/fish-feeder';
import { item as gardenLamp } from '../items/garden-lamp';
import { item as ostrichPen } from '../items/ostrich-pen';
import { item as pettingFarm } from '../items/petting-farm';
import { item as zooCafe } from '../items/zoo-cafe';

/**
 * Zoo batch z5 (the Batch column of docs/game/items-zoo.md):
 * aquarium, butterfly-house, petting-farm, zoo-cafe, ostrich-pen, bamboo-clump, fish-feeder, garden-lamp.
 * Owned by the z5 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=zoo-batch-5` on the dev server. Check: `npx vitest run src/themes/zoo/batches/z5.test.ts`.
 */
export const items: readonly ItemModel[] = [aquarium, butterflyHouse, pettingFarm, zooCafe, ostrichPen, bambooClump, fishFeeder, gardenLamp];
