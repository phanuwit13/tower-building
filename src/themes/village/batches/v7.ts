import type { ItemModel } from '../../../models/contract';
import { item as bananaGrove } from '../items/banana-grove';
import { item as rainTree } from '../items/rain-tree';
import { item as vegetableGarden } from '../items/vegetable-garden';
import { item as laundryLine } from '../items/laundry-line';
import { item as bambooFence } from '../items/bamboo-fence';
import { item as marigoldPatch } from '../items/marigold-patch';
import { item as mangoTree } from '../items/mango-tree';
import { item as coconutPalm } from '../items/coconut-palm';

/**
 * Village batch v7 (the Batch column of docs/game/items-village.md):
 * banana-grove, rain-tree, vegetable-garden, laundry-line, bamboo-fence, marigold-patch, mango-tree, coconut-palm.
 * Owned by the v7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=village-batch-7` on the dev server. Check: `npx vitest run src/themes/village/batches/v7.test.ts`.
 */
export const items: readonly ItemModel[] = [
  bananaGrove,
  rainTree,
  vegetableGarden,
  laundryLine,
  bambooFence,
  marigoldPatch,
  mangoTree,
  coconutPalm,
];
