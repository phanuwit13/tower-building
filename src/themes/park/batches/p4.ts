import type { ItemModel } from '../../../models/contract';
import { item as roseGarden } from '../items/rose-garden';
import { item as mazeHedge } from '../items/maze-hedge';
import { item as topiaryGarden } from '../items/topiary-garden';
import { item as butterflyGarden } from '../items/butterfly-garden';
import { item as flowerBed } from '../items/flower-bed';
import { item as hedgeRow } from '../items/hedge-row';
import { item as roundShrub } from '../items/round-shrub';
import { item as rockGarden } from '../items/rock-garden';
import { item as sprinkler } from '../items/sprinkler';

/**
 * Park batch p4 (the Batch column of docs/game/items-park.md):
 * rose-garden, maze-hedge, topiary-garden, butterfly-garden, flower-bed, hedge-row, round-shrub, rock-garden, sprinkler.
 * Owned by the p4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=park-batch-4` on the dev server. Check: `npx vitest run src/themes/park/batches/p4.test.ts`.
 */
export const items: readonly ItemModel[] = [roseGarden, mazeHedge, topiaryGarden, butterflyGarden, flowerBed, hedgeRow, roundShrub, rockGarden, sprinkler];
