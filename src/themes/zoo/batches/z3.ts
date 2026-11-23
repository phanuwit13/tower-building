import type { ItemModel } from '../../../models/contract';

/**
 * Zoo batch z3 (the Batch column of docs/game/items-zoo.md):
 * monkey-island, tortoise-pen, crocodile-pond, reptile-tank, koi-pond, meerkat-mound, elephant-statue, owl-stump, bunny-hutch.
 * Owned by the z3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=zoo-batch-3` on the dev server. Check: `npx vitest run src/themes/zoo/batches/z3.test.ts`.
 */
export const items: readonly ItemModel[] = [];
