import type { ItemModel } from '../../../models/contract';

/**
 * Zoo batch z6 (the Batch column of docs/game/items-zoo.md):
 * polar-bear-cove, zoo-shop, animal-clinic, turnstiles, water-trough, koala-tree, animal-balloons, binoculars, lizard-rock.
 * Owned by the z6 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=zoo-batch-6` on the dev server. Check: `npx vitest run src/themes/zoo/batches/z6.test.ts`.
 */
export const items: readonly ItemModel[] = [];
