import type { ItemModel } from '../../../models/contract';
import { item as bananaTree } from '../items/banana-tree';
import { item as chickenCoop } from '../items/chicken-coop';
import { item as coconutPalm } from '../items/coconut-palm';
import { item as fishPond } from '../items/fish-pond';
import { item as flowerGarden } from '../items/flower-garden';
import { item as flowerPlanter } from '../items/flower-planter';
import { item as schoolCat } from '../items/school-cat';
import { item as vegetableGarden } from '../items/vegetable-garden';

/**
 * School batch 3: flower-planter, banana-tree, coconut-palm, vegetable-garden, flower-garden, fish-pond, school-cat, chicken-coop.
 * Owned by the batch-3 sculptor; do not edit other batches.
 * Review: `?gallery=batch-3` on the dev server. Check: `npx vitest run src/themes/school/batches/b3.test.ts`.
 */
export const items: readonly ItemModel[] = [
  flowerPlanter, bananaTree, coconutPalm, schoolCat, vegetableGarden, chickenCoop, flowerGarden, fishPond,
];
