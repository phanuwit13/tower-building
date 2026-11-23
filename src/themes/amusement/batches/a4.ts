import type { ItemModel } from '../../../models/contract';
import { item as bumperCars } from '../items/bumper-cars';
import { item as entranceGate } from '../items/entrance-gate';
import { item as mirrorMaze } from '../items/mirror-maze';
import { item as kiddieCars } from '../items/kiddie-cars';
import { item as balloonStall } from '../items/balloon-stall';
import { item as photoBooth } from '../items/photo-booth';
import { item as faceCutout } from '../items/face-cutout';
import { item as shavedIceCart } from '../items/shaved-ice-cart';
import { item as lollipopSign } from '../items/lollipop-sign';

/**
 * Amusement batch a4 (the Batch column of docs/game/items-amusement.md):
 * bumper-cars, entrance-gate, mirror-maze, kiddie-cars, balloon-stall, photo-booth, face-cutout, shaved-ice-cart, lollipop-sign.
 * Owned by the a4 sculptor; do not edit other batches. One file per item in `../items/<id>.ts`
 * (exporting `item`); list them here in doc order.
 * Review: `?gallery=amusement-batch-4` on the dev server. Check: `npx vitest run src/themes/amusement/batches/a4.test.ts`.
 */
export const items: readonly ItemModel[] = [bumperCars, entranceGate, mirrorMaze, kiddieCars, balloonStall, photoBooth, faceCutout, shavedIceCart, lollipopSign];
