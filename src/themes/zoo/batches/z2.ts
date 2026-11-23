import type { ItemModel } from '../../../models/contract';
import { item as elephantYard } from '../items/elephant-yard';
import { item as hippoPool } from '../items/hippo-pool';
import { item as kangarooYard } from '../items/kangaroo-yard';
import { item as pandaBamboo } from '../items/panda-bamboo';
import { item as infoBoard } from '../items/info-board';
import { item as parrotPerch } from '../items/parrot-perch';
import { item as directionPost } from '../items/direction-post';
import { item as penguinBin } from '../items/penguin-bin';
import { item as waterStation } from '../items/water-station';

/**
 * Zoo batch z2 (the Batch column of docs/game/items-zoo.md):
 * elephant-yard, hippo-pool, kangaroo-yard, panda-bamboo, info-board, parrot-perch, direction-post, penguin-bin, water-station.
 * Owned by the z2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=zoo-batch-2` on the dev server. Check: `npx vitest run src/themes/zoo/batches/z2.test.ts`.
 */
export const items: readonly ItemModel[] = [
  elephantYard,
  hippoPool,
  kangarooYard,
  pandaBamboo,
  infoBoard,
  parrotPerch,
  directionPost,
  penguinBin,
  waterStation,
];
