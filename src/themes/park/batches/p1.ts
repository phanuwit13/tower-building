import type { ItemModel } from '../../../models/contract';
import { item as swanBoatLake } from '../items/swan-boat-lake';
import { item as fountainPlaza } from '../items/fountain-plaza';
import { item as koiPond } from '../items/koi-pond';
import { item as splashPad } from '../items/splash-pad';
import { item as steppingStones } from '../items/stepping-stones';
import { item as stream } from '../items/stream';
import { item as swan } from '../items/swan';
import { item as toySailboat } from '../items/toy-sailboat';
import { item as drinkingFountain } from '../items/drinking-fountain';

/**
 * Park batch p1 (the Batch column of docs/game/items-park.md): the water batch.
 * Owned by the p1 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=park-batch-1` on the dev server. Check: `npx vitest run src/themes/park/batches/p1.test.ts`.
 */
export const items: readonly ItemModel[] = [swanBoatLake, fountainPlaza, koiPond, splashPad, steppingStones, stream, swan, toySailboat, drinkingFountain];
