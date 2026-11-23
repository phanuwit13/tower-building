import type { ItemModel } from '../../../models/contract';
import { item as monkeyIsland } from '../items/monkey-island';
import { item as tortoisePen } from '../items/tortoise-pen';
import { item as crocodilePond } from '../items/crocodile-pond';
import { item as reptileTank } from '../items/reptile-tank';
import { item as koiPond } from '../items/koi-pond';
import { item as meerkatMound } from '../items/meerkat-mound';
import { item as elephantStatue } from '../items/elephant-statue';
import { item as owlStump } from '../items/owl-stump';
import { item as bunnyHutch } from '../items/bunny-hutch';

/**
 * Zoo batch z3 (the Batch column of docs/game/items-zoo.md):
 * monkey-island, tortoise-pen, crocodile-pond, reptile-tank, koi-pond, meerkat-mound, elephant-statue, owl-stump, bunny-hutch.
 * Owned by the z3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); import them here and list them in doc order.
 * Review: `?gallery=zoo-batch-3` on the dev server. Check: `npx vitest run src/themes/zoo/batches/z3.test.ts`.
 */
export const items: readonly ItemModel[] = [monkeyIsland, tortoisePen, crocodilePond, reptileTank, koiPond, meerkatMound, elephantStatue, owlStump, bunnyHutch];
