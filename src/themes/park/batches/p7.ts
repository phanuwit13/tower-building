import type { ItemModel } from '../../../models/contract';
import { item as openAirStage } from '../items/open-air-stage';
import { item as restroomBlock } from '../items/restroom-block';
import { item as flowerClock } from '../items/flower-clock';
import { item as balloonCart } from '../items/balloon-cart';
import { item as telescopeDeck } from '../items/telescope-deck';
import { item as parkTram } from '../items/park-tram';
import { item as parkMap } from '../items/park-map';
import { item as kineticSculpture } from '../items/kinetic-sculpture';

/**
 * Park batch p7 (the Batch column of docs/game/items-park.md):
 * open-air-stage, restroom-block, flower-clock, balloon-cart, telescope-deck, park-tram, park-map, kinetic-sculpture.
 * Owned by the p7 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`.
 * Review: `?gallery=park-batch-7` on the dev server. Check: `npx vitest run src/themes/park/batches/p7.test.ts`.
 */
export const items: readonly ItemModel[] = [openAirStage, restroomBlock, flowerClock, balloonCart, telescopeDeck, parkTram, parkMap, kineticSculpture];
