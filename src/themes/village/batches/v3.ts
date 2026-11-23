import type { ItemModel } from '../../../models/contract';
import { item as i0 } from '../items/buffalo-wallow';
import { item as i1 } from '../items/chicken-coop';
import { item as i2 } from '../items/cow-pen';
import { item as i3 } from '../items/pig-pen';
import { item as i4 } from '../items/goats';
import { item as i5 } from '../items/hen-and-chicks';
import { item as i6 } from '../items/ducks';
import { item as i7 } from '../items/village-dog';
import { item as i8 } from '../items/woodpile';

/**
 * Village batch v3 (the Batch column of docs/game/items-village.md):
 * buffalo-wallow, chicken-coop, cow-pen, pig-pen, goats, hen-and-chicks, ducks, village-dog, woodpile.
 * Owned by the v3 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=village-batch-3` on the dev server. Check: `npx vitest run src/themes/village/batches/v3.test.ts`.
 */
export const items: readonly ItemModel[] = [i0, i1, i2, i3, i4, i5, i6, i7, i8];
