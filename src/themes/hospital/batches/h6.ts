import type { ItemModel } from '../../../models/contract';
import { item as i0 } from '../items/pharmacy-counter';
import { item as i1 } from '../items/lab-bench';
import { item as i2 } from '../items/supply-room';
import { item as i3 } from '../items/linen-cart';
import { item as i4 } from '../items/food-trolley';
import { item as i5 } from '../items/cleaning-cart';
import { item as i6 } from '../items/fire-extinguisher';
import { item as i7 } from '../items/wet-floor-sign';

/**
 * Hospital batch h6 (the Batch column of docs/game/items-hospital.md):
 * pharmacy-counter, lab-bench, supply-room, linen-cart, food-trolley, cleaning-cart, fire-extinguisher, wet-floor-sign.
 * Owned by the h6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=hospital-batch-6` on the dev server. Check: `npx vitest run src/themes/hospital/batches/h6.test.ts`.
 */
export const items: readonly ItemModel[] = [i0, i1, i2, i3, i4, i5, i6, i7];
