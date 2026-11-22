import type { ItemModel } from '../../../models/contract';
import { item as ballBasket } from '../items/ball-basket';
import { item as bicycle } from '../items/bicycle';
import { item as bikeRack } from '../items/bike-rack';
import { item as hopscotch } from '../items/hopscotch';
import { item as muralWall } from '../items/mural-wall';
import { item as seesaw } from '../items/seesaw';
import { item as slide } from '../items/slide';
import { item as tyreHop } from '../items/tyre-hop';

/**
 * School batch 4: ball-basket, seesaw, slide, tyre-hop, hopscotch, mural-wall, bike-rack, bicycle.
 * Owned by the batch-4 sculptor; do not edit other batches.
 * Review: `?gallery=batch-4` on the dev server. Check: `npx vitest run src/themes/school/batches/b4.test.ts`.
 */
export const items: readonly ItemModel[] = [ballBasket, seesaw, slide, tyreHop, hopscotch, muralWall, bikeRack, bicycle];
