import type { ItemModel } from '../../../models/contract';
import { item as rhinoYard } from '../items/rhino-yard';
import { item as tigerDen } from '../items/tiger-den';
import { item as sealPool } from '../items/seal-pool';
import { item as ponyRide } from '../items/pony-ride';
import { item as peacockLawn } from '../items/peacock-lawn';
import { item as slothBranch } from '../items/sloth-branch';
import { item as hedgehogLog } from '../items/hedgehog-log';
import { item as toucanPost } from '../items/toucan-post';

/**
 * Zoo batch z7 (the Batch column of docs/game/items-zoo.md):
 * rhino-yard, tiger-den, seal-pool, pony-ride, peacock-lawn, sloth-branch, hedgehog-log, toucan-post.
 * Owned by the z7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=zoo-batch-7` on the dev server. Check: `npx vitest run src/themes/zoo/batches/z7.test.ts`.
 */
export const items: readonly ItemModel[] = [rhinoYard, tigerDen, sealPool, ponyRide, peacockLawn, slothBranch, hedgehogLog, toucanPost];
