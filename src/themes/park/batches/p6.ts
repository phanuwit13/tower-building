import { item as picnicLawn } from '../items/picnic-lawn';
import { item as gazebo } from '../items/gazebo';
import { item as iceCreamKiosk } from '../items/ice-cream-kiosk';
import { item as chessTables } from '../items/chess-tables';
import { item as parkBench } from '../items/park-bench';
import { item as picnicTable } from '../items/picnic-table';
import { item as coconutIceCreamCart } from '../items/coconut-ice-cream-cart';
import { item as lampPost } from '../items/lamp-post';
import type { ItemModel } from '../../../models/contract';

/**
 * Park batch p6 (the Batch column of docs/game/items-park.md):
 * picnic-lawn, gazebo, ice-cream-kiosk, chess-tables, park-bench, picnic-table, coconut-ice-cream-cart, lamp-post.
 * Owned by the p6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=park-batch-6` on the dev server. Check: `npx vitest run src/themes/park/batches/p6.test.ts`.
 */
export const items: readonly ItemModel[] = [
  picnicLawn,
  gazebo,
  iceCreamKiosk,
  chessTables,
  parkBench,
  picnicTable,
  coconutIceCreamCart,
  lampPost,
];
