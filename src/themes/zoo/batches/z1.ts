import type { ItemModel } from '../../../models/contract';
import { item as penguin_pool } from '../items/penguin-pool';
import { item as giraffe_yard } from '../items/giraffe-yard';
import { item as lion_rock } from '../items/lion-rock';
import { item as zebra_paddock } from '../items/zebra-paddock';
import { item as zoo_tram } from '../items/zoo-tram';
import { item as feed_kiosk } from '../items/feed-kiosk';
import { item as shaded_bench } from '../items/shaded-bench';
import { item as shade_tree } from '../items/shade-tree';
import { item as acacia_tree } from '../items/acacia-tree';

/**
 * Zoo batch z1 (the Batch column of docs/game/items-zoo.md):
 * penguin-pool, giraffe-yard, lion-rock, zebra-paddock, zoo-tram, feed-kiosk, shaded-bench, shade-tree, acacia-tree.
 * Owned by the z1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=zoo-batch-1` on the dev server. Check: `npx vitest run src/themes/zoo/batches/z1.test.ts`.
 */
export const items: readonly ItemModel[] = [
  penguin_pool,
  giraffe_yard,
  lion_rock,
  zebra_paddock,
  zoo_tram,
  feed_kiosk,
  shaded_bench,
  shade_tree,
  acacia_tree,
];
