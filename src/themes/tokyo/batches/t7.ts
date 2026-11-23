import type { ItemModel } from '../../../models/contract';
import { item as zenGarden } from '../items/zen-garden';
import { item as sakuraGrove } from '../items/sakura-grove';
import { item as bambooGrove } from '../items/bamboo-grove';
import { item as sakuraBench } from '../items/sakura-bench';
import { item as bonsaiShelf } from '../items/bonsai-shelf';
import { item as sakuraTree } from '../items/sakura-tree';
import { item as mapleTree } from '../items/maple-tree';
import { item as azaleaBush } from '../items/azalea-bush';

/**
 * Tokyo batch t7 (the Batch column of docs/game/items-tokyo.md):
 * zen-garden, sakura-grove, bamboo-grove, sakura-bench, bonsai-shelf, sakura-tree, maple-tree, azalea-bush.
 * Owned by the t7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=tokyo-batch-7` on the dev server. Check: `npx vitest run src/themes/tokyo/batches/t7.test.ts`.
 */
export const items: readonly ItemModel[] = [
  zenGarden,
  sakuraGrove,
  bambooGrove,
  sakuraBench,
  bonsaiShelf,
  sakuraTree,
  mapleTree,
  azaleaBush,
];
