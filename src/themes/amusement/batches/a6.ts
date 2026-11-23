import type { ItemModel } from '../../../models/contract';
import { item as i0 } from '../items/haunted-house';
import { item as i1 } from '../items/giant-house';
import { item as i2 } from '../items/food-court';
import { item as i3 } from '../items/souvenir-shop';
import { item as i4 } from '../items/restrooms';
import { item as i5 } from '../items/shooting-gallery';
import { item as i6 } from '../items/parade-float';
import { item as i7 } from '../items/double-bench';

/**
 * Amusement batch a6 (the Batch column of docs/game/items-amusement.md):
 * haunted-house, giant-house, food-court, souvenir-shop, restrooms, shooting-gallery, parade-float, double-bench.
 * Owned by the a6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); list them here in doc order.
 * Review: `?gallery=amusement-batch-6` on the dev server. Check: `npx vitest run src/themes/amusement/batches/a6.test.ts`.
 */
export const items: readonly ItemModel[] = [i0, i1, i2, i3, i4, i5, i6, i7];
