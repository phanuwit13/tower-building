import type { ItemModel } from '../../../models/contract';
import { item as playground } from '../items/playground';
import { item as sandpit } from '../items/sandpit';
import { item as climbingDome } from '../items/climbing-dome';
import { item as seesaw } from '../items/seesaw';
import { item as slide } from '../items/slide';
import { item as swings } from '../items/swings';
import { item as springRiders } from '../items/spring-riders';
import { item as mushroomStools } from '../items/mushroom-stools';
import { item as parkDog } from '../items/park-dog';

/**
 * Park batch p2 (the Batch column of docs/game/items-park.md):
 * playground, sandpit, climbing-dome, seesaw, slide, swings, spring-riders, mushroom-stools, park-dog.
 * Owned by the p2 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=park-batch-2` on the dev server. Check: `npx vitest run src/themes/park/batches/p2.test.ts`.
 */
export const items: readonly ItemModel[] = [playground, sandpit, climbingDome, seesaw, slide, swings, springRiders, mushroomStools, parkDog];
